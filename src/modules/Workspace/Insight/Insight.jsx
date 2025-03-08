import { useWorkspace } from "../../../contexts/WorkspaceProvider";
import VelocityChart from "./components/velocityChart";


const Insight = () => {
    const { workspace } = useWorkspace();
    return (
        <>
            <div className="row g-5 gx-xl-10 mb-5 mb-xl-10">
                <div className="col-md-6 col-lg-6 col-xl-6 mb-md-5 mb-xl-10">
                    <div className="card card-flush mb-5 mb-xl-10">
                        <div className="card-header border-bottom-0">
                            <h2 className="card-title">Velocity</h2>
                        </div>
                        <div className="card-body">
                            <VelocityChart />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Insight;