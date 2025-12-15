from typing import Dict, Any, List
from sqlalchemy.orm import Session
from ..models.models import Analysis, Startup
from .llm_service import llm_service
from .rag_service import rag_service
from .search_service import search_service  # ✅ NEW IMPORT


class AnalyzerService:
    """Business logic for startup analysis"""
    
    async def analyze_startup(
        self,
        db: Session,
        startup_id: int,
        analysis_type: str = "comprehensive"
    ) -> Analysis:
        """Perform comprehensive startup analysis with web validation"""
        
        print(f"\n{'='*60}")
        print(f"🔬 ANALYSIS START: Startup {startup_id}")
        print(f"{'='*60}")
        
        # Get startup
        startup = db.query(Startup).filter(Startup.id == startup_id).first()
        if not startup:
            raise ValueError("Startup not found")
        
        print(f"📊 Startup: {startup.name}")
        
        # ✅ NEW: Get web validation BEFORE analysis
        web_validation = await self._get_web_validation(startup)
        
        # Define analysis queries based on type
        queries = self._get_analysis_queries(analysis_type)
        print(f"📝 Running {len(queries)} queries")
        
        # Perform RAG for each query
        all_insights = []
        context_docs = []
        
        for i, query in enumerate(queries):
            print(f"\n--- Query {i+1}/{len(queries)} ---")
            print(f"❓ {query}")
            
            context = await rag_service.get_context(startup_id, query, max_chunks=3)
            
            print(f"📚 Retrieved {len(context)} chunks")
            total_chars = sum(len(c) for c in context)
            print(f"📏 Total context: {total_chars} chars")
            
            if total_chars < 100:
                print(f"⚠️ WARNING: Very little context retrieved!")
            
            context_docs.extend(context)
            
            if not context:
                print(f"❌ No context found - skipping query")
                continue
            
            # ✅ MODIFIED: Pass web_validation to LLM
            result = await llm_service.analyze_with_context(
                query=query,
                context_chunks=context,
                analysis_type=analysis_type,
                web_validation=web_validation  # ✅ NEW PARAMETER
            )
            all_insights.append(result)
        
        if not all_insights:
            print(f"❌ No insights generated - RAG failure!")
            raise Exception("Analysis failed: No relevant context found in documents")
        
        # Aggregate results
        aggregated = self._aggregate_insights(all_insights)
        
        # Create analysis record
        analysis = Analysis(
            startup_id=startup_id,
            analysis_type=analysis_type,
            summary=aggregated.get("summary", ""),
            key_insights=aggregated.get("key_insights", []),
            strengths=aggregated.get("strengths", []),
            weaknesses=aggregated.get("weaknesses", []),
            opportunities=aggregated.get("opportunities", []),
            threats=aggregated.get("threats", []),
            context_used={
                "chunks": len(context_docs),
                "total_chars": sum(len(c) for c in context_docs),
                "web_validation": bool(web_validation)  # ✅ Track if web search was used
            },
            confidence_score=aggregated.get("confidence", 0.8),
            raw_response=str(all_insights),
            web_validation_summary=web_validation  # ← 🆕 הוסף את השורה הזו!
        )
        
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
        
        print(f"\n{'='*60}")
        print(f"✅ ANALYSIS COMPLETE (with web validation)")
        print(f"{'='*60}\n")
        
        return analysis
    
    # ✅ NEW METHOD
    async def _get_web_validation(self, startup: Startup) -> str:
        """Get web search validation for startup claims"""
        try:
            print(f"\n🌐 Fetching web validation...")
            
            validation = await search_service.validate_startup_claims(
                startup_name=startup.name,
                industry=startup.industry if hasattr(startup, 'industry') else None,
                founder_names=None  # TODO: Extract from docs if needed
            )
            
            print(f"✅ Web validation retrieved ({len(validation)} chars)")
            return validation
            
        except Exception as e:
            print(f"⚠️ Web validation failed (continuing with docs only): {e}")
            return ""  # Graceful degradation
    
    def _get_analysis_queries(self, analysis_type: str) -> List[str]:
        """Get relevant queries for analysis type"""
        base_queries = [
            "What is the business model and value proposition?",
            "Who is the target market and customers?",
            "What is the competitive landscape?",
            "What is the team's background and expertise?",
            "What is the current traction and milestones?",
        ]
        
        if analysis_type == "comprehensive":
            base_queries.extend([
                "What are the financial projections and unit economics?",
                "What are the main risks and challenges?",
                "What is the go-to-market strategy?",
                "What is the technology or product innovation?",
            ])
        
        return base_queries
    
    def _aggregate_insights(self, insights: List[Dict]) -> Dict[str, Any]:
        """Aggregate multiple analysis results"""
        aggregated = {
            "summary": "",
            "key_insights": [],
            "strengths": [],
            "weaknesses": [],
            "opportunities": [],
            "threats": [],
            "confidence": 0.8
        }
        
        for insight in insights:
            if "summary" in insight and insight["summary"]:
                aggregated["summary"] += insight["summary"] + " "
            
            for key in ["key_insights", "strengths", "weaknesses", "opportunities"]:
                if key in insight and isinstance(insight[key], list):
                    aggregated[key].extend(insight[key])
            
            if "risks" in insight and isinstance(insight["risks"], list):
                aggregated["threats"].extend(insight["risks"])
        
        # Deduplicate and limit
        for key in ["key_insights", "strengths", "weaknesses", "opportunities", "threats"]:
            aggregated[key] = list(set(aggregated[key]))[:10]
        
        aggregated["summary"] = aggregated["summary"].strip()[:1000]
        
        return aggregated


# Singleton
analyzer_service = AnalyzerService()