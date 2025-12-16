from sqlalchemy.orm import Session
from typing import Dict, List, Any
from ..models.models import Score, Startup
from .llm_service import llm_service
from .rag_service import rag_service
from .search_service import search_service  # ✅ הוספה חדשה


class ScorerService:
    """Service for scoring startups"""
    
    # Scoring weights (must sum to 1.0)
    WEIGHTS = {
        "team_score": 0.25,
        "product_score": 0.20,
        "market_score": 0.20,
        "traction_score": 0.15,
        "financials_score": 0.10,
        "innovation_score": 0.10,
    }
    
    async def score_startup(
        self,
        db: Session,
        startup_id: int
    ) -> Score:
        """Calculate comprehensive score for a startup"""
        
        print(f"\n{'='*60}")
        print(f"📊 SCORING START: Startup {startup_id}")
        print(f"{'='*60}")
        
        # Get startup
        startup = db.query(Startup).filter(Startup.id == startup_id).first()
        if not startup:
            raise ValueError("Startup not found")
        
        print(f"🏢 Startup: {startup.name}")
        
        # ✅ NEW: Get web validation BEFORE scoring
        web_validation = await self._get_web_validation(startup)
        
        # Score each category
        scores = {}
        
        for category, weight in self.WEIGHTS.items():
            print(f"\n--- Scoring {category} (weight: {weight*100}%) ---")
            
            score = await self._score_category(startup_id, category, web_validation)  # ✅ העברת web_validation
            scores[category] = score
            
            print(f"✅ {category}: {score}/100")
        
        print(f"\n{'='*60}")
        print(f"📈 SCORES BREAKDOWN:")
        for cat, score in scores.items():
            print(f"   {cat}: {score}/100")
        print(f"{'='*60}")
        
        # Calculate overall score
        overall = sum(scores[cat] * self.WEIGHTS[cat] for cat in self.WEIGHTS.keys())
        
        print(f"\n🎯 Overall Score: {overall:.2f}/100")
        
        # Determine confidence
        confidence = self._calculate_confidence(scores)
        
        # Generate reasoning (with web validation)
        reasoning = await self._generate_reasoning(startup_id, scores, overall, web_validation)  # ✅ העברת web_validation
        
        # Create score record
        score_record = Score(
            startup_id=startup_id,
            overall_score=overall,
            team_score=scores.get("team_score", 0),
            product_score=scores.get("product_score", 0),
            market_score=scores.get("market_score", 0),
            traction_score=scores.get("traction_score", 0),
            financials_score=scores.get("financials_score", 0),
            innovation_score=scores.get("innovation_score", 0),
            score_breakdown=scores,
            reasoning=reasoning,
            scoring_criteria=self.WEIGHTS,
            confidence_level=confidence
        )
        
        db.add(score_record)
        db.commit()
        db.refresh(score_record)
        
        print(f"\n{'='*60}")
        print(f"✅ SCORING COMPLETE (with web validation)")
        print(f"{'='*60}\n")
        
        return score_record
    
    # ✅ NEW METHOD
    async def _get_web_validation(self, startup: Startup) -> str:
        """Get web search validation for startup claims"""
        try:
            print(f"\n🌐 Fetching web validation...")
            
            validation = await search_service.validate_startup_claims(
                startup_name=startup.name,
                industry=startup.industry if hasattr(startup, 'industry') else None,
                founder_names=None
            )
            
            print(f"✅ Web validation retrieved ({len(validation)} chars)")
            return validation
            
        except Exception as e:
            print(f"⚠️ Web validation failed (continuing with docs only): {e}")
            return ""  # Graceful degradation
    
    async def _score_category(
        self,
        startup_id: int,
        category: str,
        web_validation: str = ""  # ✅ פרמטר חדש
    ) -> float:
        """Score a specific category"""
        
        # Get context
        query = self._get_category_query(category)
        print(f"   Query: {query[:100]}...")
        
        context = await rag_service.get_context(startup_id, query, max_chunks=5)
        
        if not context or sum(len(c) for c in context) < 50:
            print(f"   ⚠️ WARNING: Insufficient context for {category}")
            return 50.0  # Default middle score when no info
        
        print(f"   📚 Context: {sum(len(c) for c in context)} chars")
        
        # Build scoring prompt (with web validation)
        prompt = self._build_scoring_prompt(category, context, web_validation)  # ✅ העברת web_validation
        
        # Get LLM score
        try:
            result = await llm_service.generate_structured(
                prompt=prompt,
                context=None  # Context already in prompt
            )
            
            print(f"   📝 LLM Response: {result}")
            
            # Extract score with validation
            score = float(result.get("score", 50))
            
            # Validate range
            if score < 0 or score > 100:
                print(f"   ⚠️ Score out of range: {score}, clamping to 0-100")
                score = max(0, min(100, score))
            
            return score
            
        except Exception as e:
            print(f"   ❌ Scoring failed for {category}: {str(e)}")
            return 50.0
    
    def _get_category_query(self, category: str) -> str:
        """Get search query for each category"""
        
        queries = {
            "team_score": "What is the team's background, experience, expertise, and track record? Who are the founders and key team members?",
            "product_score": "What is the product innovation, technical feasibility, product-market fit, and differentiation from competitors?",
            "market_score": "What is the market size (TAM/SAM/SOM), growth potential, market timing, and market accessibility?",
            "traction_score": "What is the revenue, user growth, customer acquisition, partnerships, and key milestones achieved?",
            "financials_score": "What are the unit economics (LTV/CAC), burn rate, runway, path to profitability, and financial projections?",
            "innovation_score": "What is the technology innovation, intellectual property (patents), business model uniqueness, and competitive moat?",
        }
        
        return queries.get(category, "Analyze this startup")
    
    def _build_scoring_prompt(self, category: str, context: List[str], web_validation: str = "") -> str:  # ✅ פרמטר חדש
        """Build prompt for scoring a category"""
        
        context_text = "\n\n---\n\n".join(context)
        
        # Category-specific criteria
        criteria_map = {
            "team_score": [
                "Founder experience (5+ years in industry)",
                "Domain expertise and track record",
                "Previous successful exits or achievements",
                "Team completeness (CTO, CEO, CPO roles covered)"
            ],
            "product_score": [
                "Innovation level and uniqueness",
                "Technical feasibility and execution",
                "Product-market fit evidence",
                "Differentiation from competitors"
            ],
            "market_score": [
                "Total addressable market size (TAM > $1B)",
                "Market growth rate (> 10% annually)",
                "Market timing and trends",
                "Market accessibility and barriers to entry"
            ],
            "traction_score": [
                "Revenue (MRR/ARR)",
                "User/customer growth rate",
                "Strategic partnerships",
                "Key milestones and achievements"
            ],
            "financials_score": [
                "Unit economics (LTV/CAC ratio > 3)",
                "Burn rate and runway (> 12 months)",
                "Path to profitability",
                "Financial sustainability"
            ],
            "innovation_score": [
                "Technology innovation and IP (patents, proprietary tech)",
                "Business model innovation",
                "Competitive moat and defensibility",
                "R&D capabilities"
            ]
        }
        
        criteria = criteria_map.get(category, [])
        criteria_text = "\n".join(f"- {c}" for c in criteria)
        
        # ✅ UPDATED PROMPT WITH WEB VALIDATION
        return f"""You are an expert startup investor. Score this startup on the {category.replace('_', ' ').title()} dimension.

SOURCE 1 (INTERNAL DOCUMENTS - Primary Truth):
{context_text}

SOURCE 2 (WEB VALIDATION - Reality Check):
{web_validation if web_validation else "No web validation available"}

EVALUATION CRITERIA:
{criteria_text}

CRITICAL SCORING RULES:
1. Base score on SOURCE 1 (documents)
2. Use SOURCE 2 to VALIDATE and ADJUST:
   - If web shows market is smaller than claimed → REDUCE market_score
   - If web reveals hidden strong competitors → REDUCE product_score/market_score
   - If web shows negative reviews/red flags → REDUCE team_score/traction_score
   - If web validates strong claims → MAINTAIN or INCREASE score
3. PENALIZE discrepancies between deck and reality

SCORING SCALE:
- 90-100: Exceptional - Best in class, unicorn potential
- 80-89: Excellent - Strong fundamentals, top 10%
- 70-79: Good - Above average, solid investment
- 60-69: Adequate - Average, meets expectations
- 50-59: Below Average - Significant gaps or unvalidated claims
- 0-49: Weak - Critical deficiencies or major red flags

IMPORTANT:
- Be objective but not overly conservative
- 50 is BELOW AVERAGE, not neutral
- Give credit for concrete achievements (patents, metrics, traction)
- REDUCE score if web validation contradicts deck claims

Respond with valid JSON:
{{
  "score": <number 0-100>,
  "justification": "2-3 sentence explanation citing specific evidence from context AND web validation",
  "key_factors": ["factor 1", "factor 2", "factor 3"]
}}

Example with web validation impact:
{{
  "score": 65,
  "justification": "The deck claims a $25B TAM, but web validation shows the actual risk management software market is only $3.68B in 2024. The team has strong technical credentials (8200 alumni CEO), but the market opportunity appears significantly overstated.",
  "key_factors": ["Market size overstated", "Strong technical team", "Limited market validation"]
}}"""
    
    def _calculate_confidence(self, scores: Dict[str, float]) -> str:
        """Calculate confidence level based on score variance"""
        
        score_values = list(scores.values())
        avg_score = sum(score_values) / len(score_values)
        variance = sum((s - avg_score) ** 2 for s in score_values) / len(score_values)
        std_dev = variance ** 0.5
        
        if std_dev < 10:
            return "High"
        elif std_dev < 20:
            return "Medium"
        else:
            return "Low"
    
    async def _generate_reasoning(
        self,
        startup_id: int,
        scores: Dict[str, float],
        overall: float,
        web_validation: str = ""  # ✅ פרמטר חדש
    ) -> str:
        """Generate detailed reasoning for the score using LLM"""
        
        print(f"\n--- Generating Overall Reasoning ---")
        
        # Get comprehensive context
        context_query = "Provide a comprehensive overview of the startup including: company name, product, technology, team, traction metrics, market opportunity, and key achievements."
        context = await rag_service.get_context(startup_id, context_query, max_chunks=8)
        
        if not context:
            # Fallback to simple reasoning
            return self._generate_simple_reasoning(scores, overall)
        
        context_text = "\n\n".join(context)
        
        # ✅ UPDATED PROMPT WITH WEB VALIDATION
        prompt = f"""You are an expert investment analyst writing a detailed investment memo.

SCORES:
Overall: {overall:.1f}/100
Team: {scores['team_score']:.0f} | Product: {scores['product_score']:.0f} | Market: {scores['market_score']:.0f}
Traction: {scores['traction_score']:.0f} | Financials: {scores['financials_score']:.0f} | Innovation: {scores['innovation_score']:.0f}

SOURCE 1 (STARTUP DOCUMENTS):
{context_text}

SOURCE 2 (WEB VALIDATION):
{web_validation if web_validation else "No web validation available"}

===== ROLE & OBJECTIVE =====
Act as a Senior VC Analyst. Review the deck AND web validation to generate a concise investment memo.

===== CRITICAL RULES =====
1. **Source Truth:** Use documents as primary, web as reality check
2. **Flag Discrepancies:** Explicitly mention when web contradicts deck
3. **Output:** Provide the specific structure below

===== OUTPUT STRUCTURE =====

### 🎯 Executive Summary
* **Verdict:** "[Company Name] scored **{overall:.1f}/100**. A [Solid/Risky/High-Potential] opportunity."
* **The Hook:** One sentence explaining the core value proposition.

### 🚀 Key Strengths
* Choose the top 3 categories from [Product, Market, Traction, Innovation, Financials, Team].
* Format: "* **[Category Name] ([Score]):** [One sentence evidence with numbers]."

### ⚠️ Critical Risks
* Choose the lowest scoring category.
* Format: "* **[Category Name] ([Score]):** [Specific concern]."
* **Web Validation Flags:** [Mention ANY discrepancies between deck and web research]
* **Financial Reality:** [One sentence on projections/burn rate].

### 💡 Final Recommendation
* One decisive sentence on the investment decision considering both sources.

---
### 📊 DATA_FOR_UI (Strictly output this list for parsing)
* Team: {scores['team_score']:.0f}
* Product: {scores['product_score']:.0f}
* Market: {scores['market_score']:.0f}
* Traction: {scores['traction_score']:.0f}
* Financials: {scores['financials_score']:.0f}
* Innovation: {scores['innovation_score']:.0f}
* Overall: {overall:.1f}"""
         
        try:
            # Generate using LLM
            reasoning = await llm_service.generate(
                prompt=prompt,
                context=None,
                temperature=0.7,
                max_tokens=11000
            )
            
            # Clean up response
            reasoning = reasoning.strip()
            
            # Remove any markdown code blocks
            if "```" in reasoning:
                parts = reasoning.split("```")
                reasoning = parts[1] if len(parts) >= 3 else parts[0]
                reasoning = reasoning.strip()
            
            print(f"✅ Generated reasoning ({len(reasoning)} chars)")
            
            return reasoning
            
        except Exception as e:
            print(f"❌ Reasoning generation failed: {str(e)}")
            return self._generate_simple_reasoning(scores, overall)
    
    def _generate_simple_reasoning(self, scores: Dict[str, float], overall: float) -> str:
        """Fallback simple reasoning when LLM fails"""
        
        # Find strengths and weaknesses
        sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        top_categories = sorted_scores[:3]
        bottom_category = sorted_scores[-1]
        
        reasoning = f"""### 🎯 Executive Summary
The startup received an overall score of **{overall:.1f}/100**.

### 🚀 Key Strengths
"""
        
        for cat, score in top_categories:
            cat_name = cat.replace('_', ' ').title().replace(' Score', '')
            reasoning += f"* **{cat_name} ({score:.0f}):** Strong performance in this area.\n"
        
        reasoning += f"""
### ⚠️ Critical Risks
* **{bottom_category[0].replace('_', ' ').title().replace(' Score', '')} ({bottom_category[1]:.0f}):** Needs improvement.

### 💡 Final Recommendation
Consider this investment opportunity with careful attention to the identified weaknesses.

---
### 📊 DATA_FOR_UI
"""
        
        for cat, score in scores.items():
            cat_name = cat.replace('_score', '').title()
            reasoning += f"* {cat_name}: {score:.0f}\n"
        
        reasoning += f"* Overall: {overall:.1f}\n"
        
        return reasoning


# Singleton
scorer_service = ScorerService()