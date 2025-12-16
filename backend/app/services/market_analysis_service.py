from typing import Dict, Any, List
from sqlalchemy.orm import Session
from ..models.models import MarketAnalysis, Startup
from .llm_service import llm_service
from .rag_service import rag_service
from .search_service import search_service


class MarketAnalysisService:
    """Service for analyzing market size and opportunity"""
    
    async def analyze_market(
        self,
        db: Session,
        startup_id: int
    ) -> MarketAnalysis:
        """Perform comprehensive market analysis with validation"""
        
        print(f"\n{'='*60}")
        print(f"📊 MARKET ANALYSIS START: Startup {startup_id}")
        print(f"{'='*60}")
        
        # Get startup
        startup = db.query(Startup).filter(Startup.id == startup_id).first()
        if not startup:
            raise ValueError("Startup not found")
        
        print(f"🏢 Startup: {startup.name}")
        
        # Step 1: Get claimed market size from documents
        claimed_market = await self._extract_claimed_market(startup_id)
        
        # Step 2: Get validated market size from web
        validated_market = await self._validate_market_size(startup, claimed_market)
        
        # Step 3: Generate market insights
        insights = await self._generate_market_insights(
            startup_id, 
            claimed_market, 
            validated_market
        )
        
        # Create market analysis record
        market_analysis = MarketAnalysis(
            startup_id=startup_id,
            tam_value=claimed_market.get("tam", 0),
            sam_value=claimed_market.get("sam", 0),
            som_value=claimed_market.get("som", 0),
            tam_description=claimed_market.get("tam_desc", ""),
            sam_description=claimed_market.get("sam_desc", ""),
            som_description=claimed_market.get("som_desc", ""),
            validated_tam=validated_market.get("tam", 0),
            validated_sam=validated_market.get("sam", 0),
            validated_som=validated_market.get("som", 0),
            validation_source=validated_market.get("source", ""),
            market_insights=insights.get("insights", []),
            growth_rate=insights.get("growth_rate", ""),
            confidence_level=insights.get("confidence", "Medium")
        )
        
        db.add(market_analysis)
        db.commit()
        db.refresh(market_analysis)
        
        print(f"\n{'='*60}")
        print(f"✅ MARKET ANALYSIS COMPLETE")
        print(f"{'='*60}\n")
        
        return market_analysis
    
    async def _extract_claimed_market(self, startup_id: int) -> Dict[str, Any]:
        """Extract market size claims from documents"""
        try:
            print(f"\n📈 Extracting claimed market size...")
            
            context = await rag_service.get_context(
                startup_id,
                "What is the TAM (Total Addressable Market), SAM (Serviceable Addressable Market), and SOM (Serviceable Obtainable Market)? What are the exact numbers in billions of dollars?",
                max_chunks=5
            )
            
            if not context:
                return {"tam": 0, "sam": 0, "som": 0}
            
            context_text = "\n\n".join(context)
            
            prompt = f"""Extract market size claims from this startup pitch deck.

CONTEXT:
{context_text}

Extract:
1. TAM (Total Addressable Market) - in billions USD
2. SAM (Serviceable Addressable Market) - in billions USD
3. SOM (Serviceable Obtainable Market) - in billions USD
4. Description of each market segment

Respond with ONLY valid JSON:
{{
  "tam": <number in billions, e.g., 150.5>,
  "sam": <number in billions>,
  "som": <number in billions>,
  "tam_desc": "Brief description",
  "sam_desc": "Brief description",
  "som_desc": "Brief description"
}}

If no market data found, return zeros."""

            result = await llm_service.generate_structured(
                prompt=prompt,
                context=None
            )
            
            print(f"✅ Claimed - TAM: ${result.get('tam', 0)}B, SAM: ${result.get('sam', 0)}B, SOM: ${result.get('som', 0)}B")
            
            return result
            
        except Exception as e:
            print(f"⚠️ Market extraction failed: {e}")
            return {"tam": 0, "sam": 0, "som": 0}
    
    async def _validate_market_size(self, startup: Startup, claimed: Dict) -> Dict[str, Any]:
        """Validate market size using web search"""
        try:
            print(f"\n🌐 Validating market size with web search...")
            
            # Get industry from claimed descriptions or use startup industry
            industry = claimed.get("tam_desc", "") or (startup.industry if hasattr(startup, 'industry') else "")
            
            validation = await search_service.validate_startup_claims(
                startup_name=startup.name,
                industry=industry,
                founder_names=None
            )
            
            # Ask LLM to extract validated market size
            prompt = f"""From this web validation data, extract the ACTUAL market size.

WEB VALIDATION:
{validation}

Task: Find the actual market size mentioned in credible sources.
Look for phrases like:
- "market size: $X billion"
- "valued at $X billion"
- "TAM of $X billion"

Respond with ONLY valid JSON:
{{
  "tam": <validated TAM in billions>,
  "sam": <estimate SAM as 30% of TAM>,
  "som": <estimate SOM as 10% of SAM>,
  "source": "Brief description of source"
}}

If no market data found, return zeros."""

            result = await llm_service.generate_structured(
                prompt=prompt,
                context=None
            )
            
            print(f"✅ Validated - TAM: ${result.get('tam', 0)}B from {result.get('source', 'N/A')}")
            
            return result
            
        except Exception as e:
            print(f"⚠️ Market validation failed: {e}")
            return {"tam": 0, "sam": 0, "som": 0, "source": "Validation unavailable"}
    
    async def _generate_market_insights(
        self, 
        startup_id: int,
        claimed: Dict,
        validated: Dict
    ) -> Dict[str, Any]:
        """Generate insights comparing claimed vs validated market"""
        
        insights = []
        
        claimed_tam = claimed.get("tam", 0)
        validated_tam = validated.get("tam", 0)
        
        if claimed_tam > 0 and validated_tam > 0:
            inflation = claimed_tam / validated_tam
            
            if inflation > 10:
                insights.append(f"🚨 CRITICAL: Market size grossly exaggerated ({inflation:.1f}x inflation)")
            elif inflation > 5:
                insights.append(f"⚠️ Market size significantly overstated ({inflation:.1f}x inflation)")
            elif inflation > 2:
                insights.append(f"⚠️ Market size appears inflated ({inflation:.1f}x inflation)")
            elif inflation < 0.8:
                insights.append(f"✅ Conservative market sizing (claimed {1/inflation:.1f}x smaller than actual)")
            else:
                insights.append(f"✅ Realistic market sizing (within acceptable range)")
        
        return {
            "insights": insights,
            "growth_rate": "Data unavailable",
            "confidence": "High" if validated_tam > 0 else "Low"
        }


# Singleton
market_analysis_service = MarketAnalysisService()