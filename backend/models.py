"""Pydantic models for the underwriter agent."""

from pydantic import BaseModel
from typing import Optional, List, Dict, Any


class UnderwriteRequest(BaseModel):
    company_name: str
    location: Optional[str] = None


class Source(BaseModel):
    title: str
    url: str
    favicon: Optional[str] = None


class CompanyInfoData(BaseModel):
    legal_name: Optional[str] = None
    address: Optional[str] = None
    industry: Optional[str] = None
    naics_code: Optional[str] = None
    employees: Optional[str] = None
    revenue: Optional[str] = None
    founded: Optional[str] = None
    leadership: Optional[str] = None
    ownership: Optional[str] = None
    summary: Optional[str] = None


class AdverseNewsItem(BaseModel):
    headline: str
    date: Optional[str] = None
    summary: str
    urls: Optional[List[str]] = None


class AdverseNewsData(BaseModel):
    items: List[AdverseNewsItem] = []
    overall_assessment: Optional[str] = None


class RiskAssessmentData(BaseModel):
    financial_health: Optional[str] = None
    credit_ratings: Optional[str] = None
    operational_risks: Optional[str] = None
    compliance_history: Optional[str] = None
    litigation_history: Optional[str] = None
    overall_risk_rating: Optional[str] = None
    summary: Optional[str] = None


class ProductsServicesData(BaseModel):
    products: Optional[str] = None
    services: Optional[str] = None
    market_segments: Optional[str] = None
    competitive_positioning: Optional[str] = None
    summary: Optional[str] = None


class ClaimsHistoryData(BaseModel):
    insurance_claims: Optional[str] = None
    loss_records: Optional[str] = None
    workplace_incidents: Optional[str] = None
    safety_record: Optional[str] = None
    summary: Optional[str] = None


class UnderwriteResponse(BaseModel):
    company_name: str
    location: Optional[str] = None
    company_info: Optional[Dict[str, Any]] = None
    adverse_news: Optional[Dict[str, Any]] = None
    risk_assessment: Optional[Dict[str, Any]] = None
    products_services: Optional[Dict[str, Any]] = None
    claims_history: Optional[Dict[str, Any]] = None
    sources: Optional[Dict[str, List[Source]]] = None
