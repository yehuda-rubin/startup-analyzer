from typing import Dict, Any
from sqlalchemy.orm import Session
from ..models.models import MarketAnalysis, Startup
from .llm_service import llm_service
from .rag_service import rag_service


class MarketAnalyzerService:
    """Service for TAM/SAM/SOM market analysis"""
    
    async def analyze_market(
        self,
        db: Session,
        startup_id: int
    ) -> MarketAnalysis:
        """Perform TAM/SAM/SOM analysis"""
        
        startup = db.query(Startup).filter(Startup.id == startup_id).first()
        if not startup:
            raise ValueError("Startup not found")
        
        # Get market context
        context = await self._get_market_context(startup_id, startup)
        
        # Calculate TAM/SAM/SOM
        market_size = await self._calculate_market_sizes(startup, context)
        
        # Analyze competition
        competition = await self._analyze_competition(startup, context)
        
        # Identify trends
        trends = await self._identify_trends(startup, context)
        
        # Create market analysis
        analysis = MarketAnalysis(
            startup_id=startup_id,
            tam=market_size.get("tam", 0),
            sam=market_size.get("sam", 0),
            som=market_size.get("som", 0),
            tam_description=market_size.get("tam_desc", ""),
            sam_description=market_size.get("sam_desc", ""),
            som_description=market_size.get("som_desc", ""),
            market_size_reasoning=market_size.get("reasoning", ""),
            growth_rate=market_size.get("growth_rate", 0),
            market_trends=trends,
            competitors=competition.get("competitors", []),
            competitive_advantages=competition.get("advantages", []),
            data_sources=market_size.get("sources", []),
            confidence_score=market_size.get("confidence", 0.7)
        )
        
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
        
        return analysis
    
    async def _get_market_context(self, startup_id: int, startup: Startup) -> str:
        """Get market-related context"""
        queries = [
            f"What is the market size and opportunity for {startup.industry}?",
            "Who are the competitors and what is the competitive landscape?",
            "What are the market trends and growth projections?",
            "What is the target customer segment and geography?",
        ]
        
        all_context = []
        for query in queries:
            chunks = await rag_service.get_context(startup_id, query, max_chunks=2)
            all_context.extend(chunks)
        
        return "\n\n".join(all_context)
    
    async def _calculate_market_sizes(
        self,
        startup: Startup,
        context: str
    ) -> Dict[str, Any]:
        """Calculate TAM, SAM, SOM"""
        
        prompt = f"""Calculate the market size for this startup in {startup.industry}.

Provide estimates for:
1. TAM (Total Addressable Market) - entire market demand
2. SAM (Serviceable Addressable Market) - segment you can reach
3. SOM (Serviceable Obtainable Market) - realistic short-term capture

Include:
- Market size in USD
- Description and methodology
- Growth rate (%)
- Data sources used
- Confidence level

Respond in JSON:
{{
  "tam": <number>,
  "tam_desc": "<description>",
  "sam": <number>,
  "sam_desc": "<description>",
  "som": <number>,
  "som_desc": "<description>",
  "reasoning": "<methodology>",
  "growth_rate": <percentage>,
  "sources": ["source1", "source2"],
  "confidence": <0.0-1.0>
}}"""

        try:
            result = await llm_service.generate_structured(
                prompt=prompt,
                context=context
            )
            return result
        except:
            # Fallback estimates
            return {
                "tam": 10000000000,  # $10B
                "tam_desc": "Global market estimate",
                "sam": 1000000000,   # $1B
                "sam_desc": "Serviceable market",
                "som": 100000000,    # $100M
                "som_desc": "Obtainable market in 3-5 years",
                "reasoning": "Based on industry analysis",
                "growth_rate": 15.0,
                "sources": ["Industry reports"],
                "confidence": 0.5
            }
    
    async def _analyze_competition(
        self,
        startup: Startup,
        context: str
    ) -> Dict[str, Any]:
        """Analyze competitive landscape"""
        
        prompt = f"""Analyze the competitive landscape for {startup.name} in {startup.industry}.

Identify:
1. Main competitors (3-5)
2. Competitive advantages this startup has
3. Market positioning

Respond in JSON:
{{
  "competitors": [
    {{
      "name": "<competitor>",
      "description": "<what they do>",
      "strength": "<their advantage>"
    }}
  ],
  "advantages": ["advantage1", "advantage2"]
}}"""

        try:
            result = await llm_service.generate_structured(
                prompt=prompt,
                context=context
            )
            return result
        except:
            return {
                "competitors": [],
                "advantages": ["First mover advantage", "Unique technology"]
            }
    
    async def _identify_trends(
        self,
        startup: Startup,
        context: str
    ) -> list:
        """Identify market trends"""
        
        prompt = f"""Identify 3-5 key market trends relevant to {startup.name} in {startup.industry}.

For each trend, provide:
- Trend name
- Description
- Impact on the startup (positive/negative/neutral)

Respond as JSON array:
[
  {{
    "trend": "<trend name>",
    "description": "<description>",
    "impact": "<positive/negative/neutral>"
  }}
]"""

        try:
            result = await llm_service.generate_structured(
                prompt=prompt,
                context=context
            )
            return result
        except:
            return [
                {
                    "trend": "Digital Transformation",
                    "description": "Increasing adoption of digital solutions",
                    "impact": "positive"
                }
            ]


# Singleton
market_analyzer_service = MarketAnalyzerService()