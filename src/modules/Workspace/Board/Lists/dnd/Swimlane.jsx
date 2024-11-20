import { useState, useEffect } from "react";
import { useWorkspace } from "../../../../../contexts/WorkspaceProvider";
import { Avatars,StyledAvatar } from "../../Filters/Styles";

const headerStyle = {
    top: `110px`,
    backgroundColor: "white",
    zIndex: 75
  }

  const Swimlane = ({ title, children, filters }) => {
    const { projectUsers } = useWorkspace();
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [avatars, setAvatars] = useState([]); // State to hold avatar data

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    useEffect(() => {
        if (filters.groupBy === "userIds") {
            const userIds = title.split(","); 

            const foundAvatars = userIds.map(userId => {
                const user = projectUsers.find(user => user.id === userId);
                if (user) {
                    return {
                      avatarUrl: user.avatarUrl,
                      name: user.name
                    }; 
                } else {
                    return null; // Return null for not found users
                }
            }).filter(Boolean); // Filter out null values

            setAvatars(foundAvatars);          
        }
    }, [title, filters.groupBy, projectUsers]); 

        // Display title or fallback message
        const displayTitle = () => {
            if (filters.groupBy === "userIds") {
                return avatars.length > 0 ? (
                    <Avatars>
                           {avatars.map(user => (
                                   <StyledAvatar 
                                       key={user.name} // Or a unique ID if available
                                       avatarUrl={user.avatarUrl} 
                                       name={user.name} 
                                   />
                               ))}
                    </Avatars>
                ) : "Untitled Users";
            } else {
                if (title === 'undefined') {
                    return `No ${filters.groupBy}`; // Display "No filters.groupBy"
                } else {
               return title ? title : `No ${filters.groupBy}`; // Display "No filters.groupBy"
                }
            }
        };

    return (
        <>
        <div className="card shadow-sm">
            {filters.groupBy !== 'None' && ( // Hide header if no grouping
                <div className="d-flex flex-wrap flex-stack pt-5 card-header sticky-top" style={headerStyle} onClick={toggleCollapse}>
                    <h3 className="fw-bold my-2">
                        {displayTitle() }  
                        <span className={` ms-3 fs-6 text-gray-500 fw-semibold ms-1 bi bi-chevron-${isCollapsed ? 'down' : 'right'}`}></span>
                    </h3>
                </div>
            )}

            <div className={`card-body collapse ${isCollapsed ? 'show' : ''}`}>
                {children}
            </div>
        </div>
        <div className="mt-1 mb-1"></div>
        </>
    );
};

export default Swimlane;