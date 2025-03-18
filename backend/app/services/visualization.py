import logging
from typing import Dict, List, Optional
from sqlalchemy.orm import Session
from models import File, NetworkAnalysis, MemoryAnalysis
from core.enums import AnalysisStatus

logger = logging.getLogger(__name__)

class VisualizationService:
    """Service for handling data visualization."""
    
    def __init__(self, db: Session):
        self.db = db
        
    def get_network_topology(self, file_id: int) -> Dict:
        """Get network topology data for visualization."""
        try:
            analysis = self.db.query(NetworkAnalysis).filter(
                NetworkAnalysis.file_id == file_id,
                NetworkAnalysis.status == AnalysisStatus.COMPLETED
            ).first()
            
            if not analysis:
                return {"error": "Network analysis not found or incomplete"}
                
            return analysis.result_json
            
        except Exception as e:
            logger.error(f"Failed to get network topology: {str(e)}")
            return {"error": "Failed to get network topology"}
            
    def get_memory_analysis(self, file_id: int) -> Dict:
        """Get memory analysis data for visualization."""
        try:
            analysis = self.db.query(MemoryAnalysis).filter(
                MemoryAnalysis.file_id == file_id,
                MemoryAnalysis.status == AnalysisStatus.COMPLETED
            ).first()
            
            if not analysis:
                return {"error": "Memory analysis not found or incomplete"}
                
            return analysis.result_json
            
        except Exception as e:
            logger.error(f"Failed to get memory analysis: {str(e)}")
            return {"error": "Failed to get memory analysis"}
            
    def get_file_analysis_timeline(self, file_id: int) -> List[Dict]:
        """Get timeline of file analysis events."""
        try:
            file = self.db.query(File).filter(File.id == file_id).first()
            if not file:
                return []
                
            timeline = []
            if file.uploaded_at:
                timeline.append({
                    "timestamp": file.uploaded_at.isoformat(),
                    "event": "File uploaded",
                    "details": {"filename": file.filename}
                })
                
            if file.last_analyzed:
                timeline.append({
                    "timestamp": file.last_analyzed.isoformat(),
                    "event": "Analysis completed",
                    "details": {"status": file.analysis_status.value}
                })
                
            return timeline
            
        except Exception as e:
            logger.error(f"Failed to get analysis timeline: {str(e)}")
            return [] 