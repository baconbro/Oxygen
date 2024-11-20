import { useAuth } from "../../modules/auth";
import WorkspaceHeaderMenu from "../../layout/components/header/Workspace";
import EmptyWorkspace from "../../components/common/emptyStates/emptyWorkspace";
import { useGetSpaces } from "../../services/workspaceServices";



export const Workspacehome = () => {
    const { currentUser } = useAuth();
    const { data: workspaces, status, error } = useGetSpaces(currentUser?.all?.currentOrg);
    // Determine whether to show the loading spinner and the empty workspace message
    const isLoading = status === 'loading';
    const showNoWorkspaceFound = status === 'success' && (!workspaces || workspaces.length === 0);

    return (
        <>
            <div className="card shadow-sm">
                <div className="card-body">
                    <div className="row">
                        {workspaces && workspaces.length ? <WorkspaceHeaderMenu spaces={workspaces} /> : (
                            <>
                                {isLoading &&
                                    <span>Loading
                                        <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                                    </span>}
                                {showNoWorkspaceFound && (
                                    <>
                                        <WorkspaceHeaderMenu spaces={workspaces} />
                                        <EmptyWorkspace />
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};