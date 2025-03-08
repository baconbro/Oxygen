import { useState, useEffect } from "react";
import { useWorkspace } from "../../../contexts/WorkspaceProvider";
import VelocityChart from "./components/velocityChart";
import CumulativeFlowChart from "./components/cumulativeFlowChart";
import BurndownChart from "./components/burndownChart";
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../../../services/firestore';
import ErrorBoundary from "../../../components/ErrorBoundary";

// Import CSS
import '../../../assets/css/insights.css';

const Insight = () => {
    const { project } = useWorkspace();
    const [backfillMessage, setBackfillMessage] = useState(null);
    const [historyCount, setHistoryCount] = useState(0);
    
    // Check if we already have history data
    useEffect(() => {
        if (project?.org && project?.spaceId) {
            const checkHistoryData = async () => {
                try {
                    const historyColRef = collection(db, 'organisation', project.org, 'spaces', project.spaceId, 'issueHistory');
                    const snapshot = await getDocs(query(historyColRef));
                    setHistoryCount(snapshot.size);
                    
                    if (snapshot.size > 0) {
                        setBackfillMessage({ 
                            type: "success", 
                            text: `Found ${snapshot.size} history entries. Data is ready.` 
                        });
                    } else {
                        setBackfillMessage({ 
                            type: "warning", 
                            text: "No history data found. Please click 'Initialize Historical Data' to create data." 
                        });
                    }
                } catch (error) {
                    console.error("Error checking history data:", error);
                }
            };
            
            checkHistoryData();
        }
    }, [project?.org, project?.spaceId]);
    
    
    return (
        <div className="container-fluid">
            <div className="row g-5 gx-xl-10 mb-xl-10">
                {/* Velocity Chart Card */}
                <div className="col-md-6 col-lg-6 col-xl-6 mb-5">
                    <div className="card card-flush h-100">
                        <div className="card-header border-bottom-0">
                            <h2 className="card-title">Velocity</h2>
                        </div>
                        <div className="card-body overflow-hidden">
                            <ErrorBoundary>
                                <VelocityChart />
                            </ErrorBoundary>
                        </div>
                    </div>
                </div>
                
                {/* Cumulative Flow Chart Card */}
                <div className="col-md-6 col-lg-6 col-xl-6 mb-5">
                    <div className="card card-flush h-100">
                        <div className="card-header border-bottom-0 d-flex justify-content-between align-items-center">
                            <h2 className="card-title">Cumulative Flow</h2>
                        </div>
                        <div className="card-body overflow-hidden">
                            {backfillMessage && (
                                <div className={`alert alert-${backfillMessage.type === "error" ? "danger" : backfillMessage.type} mb-4`}>
                                    {backfillMessage.text}
                                </div>
                            )}
                            <ErrorBoundary>
                                <CumulativeFlowChart />
                            </ErrorBoundary>
                        </div>
                    </div>
                </div>
                
                {/* Sprint Burndown Chart Card */}
                <div className="col-md-6 col-lg-6 col-xl-6 mb-5">
                    <div className="card card-flush h-100">
                        <div className="card-header border-bottom-0">
                            <h2 className="card-title">Sprint Burndown</h2>
                        </div>
                        <div className="card-body overflow-hidden">
                            <ErrorBoundary>
                                <BurndownChart />
                            </ErrorBoundary>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Insight;