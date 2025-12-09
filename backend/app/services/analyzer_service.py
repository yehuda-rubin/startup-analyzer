from typing import Dict, Any, List
from sqlalchemy.orm import Session
from ..models.models import Analysis, Startup
from .llm_service import llm_service
from .rag_service import rag_service


class AnalyzerService:
    """Business logic for startup analysis"""
    
    async def analyze_startup(
        self,
        db: Session,
        startup_id: int,
        analysis_type: str = "comprehensive"
    ) -> Analysis:
        """Perform comprehensive startup analysis"""
        
        # Get startup
        startup = db.query(Startup).filter(Startup.id == startup_id).first()
        if not startup:
            raise ValueError("Startup not found")
        
        # Define analysis queries based on type
        queries = self._get_analysis_queries(analysis_type)
        
        # Perform RAG for each query
        all_insights = []
        context_docs = []
        
        for query in queries:
            context = await rag_service.get_context(startup_id, query, max_chunks=3)
            context_docs.extend(context)
            
            result = await llm_service.analyze_with_context(
                query=query,
                context_chunks=context,
                analysis_type=analysis_type
            )
            all_insights.append(result)
        
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
            context_used={"chunks": len(context_docs)},
            confidence_score=aggregated.get("confidence", 0.8),
            raw_response=str(all_insights)
        )
        
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
        
        return analysis
    
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