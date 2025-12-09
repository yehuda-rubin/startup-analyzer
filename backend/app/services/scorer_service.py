from typing import Dict, Any
from sqlalchemy.orm import Session
from ..models.models import Score, Startup, Analysis
from .llm_service import llm_service
from .rag_service import rag_service


class ScorerService:
    """Service for scoring startups"""
    
    SCORING_CRITERIA = {
        "team_score": {
            "weight": 0.25,
            "factors": ["Experience", "Domain expertise", "Track record", "Completeness"]
        },
        "product_score": {
            "weight": 0.20,
            "factors": ["Innovation", "Technical feasibility", "Product-market fit", "Differentiation"]
        },
        "market_score": {
            "weight": 0.20,
            "factors": ["Market size", "Growth potential", "Market timing", "Accessibility"]
        },
        "traction_score": {
            "weight": 0.15,
            "factors": ["Revenue", "User growth", "Partnerships", "Milestones"]
        },
        "financials_score": {
            "weight": 0.10,
            "factors": ["Unit economics", "Burn rate", "Runway", "Path to profitability"]
        },
        "innovation_score": {
            "weight": 0.10,
            "factors": ["Technology", "Business model", "IP/Patents", "Competitive moat"]
        }
    }
    
    async def score_startup(
        self,
        db: Session,
        startup_id: int
    ) -> Score:
        """Calculate comprehensive startup score"""
        
        startup = db.query(Startup).filter(Startup.id == startup_id).first()
        if not startup:
            raise ValueError("Startup not found")
        
        # Get context from RAG
        scoring_context = await self._gather_scoring_context(startup_id)
        
        # Score each category
        category_scores = {}
        score_breakdown = {}
        
        for category, criteria in self.SCORING_CRITERIA.items():
            score_result = await self._score_category(
                startup_id,
                category,
                criteria,
                scoring_context
            )
            category_scores[category] = score_result["score"]
            score_breakdown[category] = score_result
        
        # Calculate overall score
        overall_score = sum(
            category_scores[cat] * self.SCORING_CRITERIA[cat]["weight"]
            for cat in category_scores
        )
        
        # Generate reasoning
        reasoning = await self._generate_reasoning(
            startup,
            category_scores,
            overall_score,
            scoring_context
        )
        
        # Determine confidence level
        confidence = self._calculate_confidence(scoring_context)
        
        # Create score record
        score = Score(
            startup_id=startup_id,
            overall_score=round(overall_score, 2),
            team_score=round(category_scores.get("team_score", 0), 2),
            product_score=round(category_scores.get("product_score", 0), 2),
            market_score=round(category_scores.get("market_score", 0), 2),
            traction_score=round(category_scores.get("traction_score", 0), 2),
            financials_score=round(category_scores.get("financials_score", 0), 2),
            innovation_score=round(category_scores.get("innovation_score", 0), 2),
            score_breakdown=score_breakdown,
            reasoning=reasoning,
            scoring_criteria=self.SCORING_CRITERIA,
            confidence_level=confidence
        )
        
        db.add(score)
        db.commit()
        db.refresh(score)
        
        return score
    
    async def _gather_scoring_context(self, startup_id: int) -> Dict[str, str]:
        """Gather context for scoring"""
        contexts = {}
        
        queries = [
            ("team", "Tell me about the founding team, their experience, and track record"),
            ("product", "Describe the product, technology, and innovation"),
            ("market", "What is the market opportunity and competitive landscape?"),
            ("traction", "What traction, revenue, users, or growth has been achieved?"),
            ("financials", "What are the financial metrics, burn rate, and projections?"),
        ]
        
        for key, query in queries:
            chunks = await rag_service.get_context(startup_id, query, max_chunks=3)
            contexts[key] = "\n".join(chunks)
        
        return contexts
    
    async def _score_category(
        self,
        startup_id: int,
        category: str,
        criteria: Dict,
        context: Dict[str, str]
    ) -> Dict[str, Any]:
        """Score a specific category"""
        
        category_name = category.replace("_score", "")
        context_text = context.get(category_name, "")
        
        prompt = f"""Score this startup on the {category_name} dimension on a scale of 0-100.

Evaluation Factors: {', '.join(criteria['factors'])}

Provide a score (0-100) and brief justification.

Respond in JSON format:
{{
  "score": <number 0-100>,
  "justification": "<brief explanation>",
  "key_factors": ["factor1", "factor2"]
}}"""

        try:
            result = await llm_service.generate_structured(
                prompt=prompt,
                context=context_text
            )
            return result
        except:
            # Fallback
            return {
                "score": 50,
                "justification": "Insufficient data for accurate scoring",
                "key_factors": []
            }
    
    async def _generate_reasoning(
        self,
        startup: Startup,
        scores: Dict[str, float],
        overall: float,
        context: Dict[str, str]
    ) -> str:
        """Generate human-readable reasoning for the score"""
        
        prompt = f"""Generate a concise executive summary explaining why {startup.name} received an overall score of {overall:.1f}/100.

Category Scores:
- Team: {scores.get('team_score', 0):.1f}
- Product: {scores.get('product_score', 0):.1f}
- Market: {scores.get('market_score', 0):.1f}
- Traction: {scores.get('traction_score', 0):.1f}
- Financials: {scores.get('financials_score', 0):.1f}
- Innovation: {scores.get('innovation_score', 0):.1f}

Write 2-3 paragraphs highlighting the main strengths and concerns."""

        all_context = "\n\n".join(context.values())
        reasoning = await llm_service.generate(prompt, context=all_context, temperature=0.5)
        
        return reasoning
    
    def _calculate_confidence(self, context: Dict[str, str]) -> str:
        """Calculate confidence level based on available data"""
        total_chars = sum(len(v) for v in context.values())
        
        if total_chars > 5000:
            return "High"
        elif total_chars > 2000:
            return "Medium"
        else:
            return "Low"


# Singleton
scorer_service = ScorerService()