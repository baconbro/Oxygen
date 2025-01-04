import { useFetchOKRs } from "../../../services/okrServices";
import { Avatar, Select, Icon } from '../../../components/common';
import { User, Username } from "../AssigneesReporter/Styles";
import { useState, useEffect } from "react";
import { useWorkspace } from "../../../contexts/WorkspaceProvider";
import { useAuth } from "../../auth";

const GoalIssueLink = ({ issue, updateIssue }) => {
    const { goals, setGoals } = useWorkspace();
    const { currentUser } = useAuth();
    const [goalsOptions, setGoalsOptions] = useState(goals.map(goal => ({ value: goal.id, label: goal.title })));
    const { data: okrs, status, error } = useFetchOKRs(currentUser?.all?.currentOrg);

    useEffect(() => {
        if (goals && goals.length > 0) {
            setGoalsOptions(goals.map(goal => ({ value: goal.id, label: goal.title })));
        } else if (status === 'success' && okrs) {
            setGoals(okrs);
            setGoalsOptions(okrs.map(goal => ({ value: goal.id, label: goal.title })));
        }
    }, [goals, okrs, status]);

    const getGoalById = goalId => {
        return goals.find(goal => goal.id === goalId)
    }

    return (
        <>
            <Select
                variant="empty"
                dropdownWidth={343}
                withClearValue={false}
                name="goalLink"
                value={issue.goalLink}
                options={goalsOptions}
                onChange={goalId => updateIssue({ goalLink: goalId })}
                renderValue={({ value: goalId }) => renderUser(getGoalById(goalId), true)}
                renderOption={({ value: goalId }) => renderUser(getGoalById(goalId))}
            />
        </>
    );

};


const renderUser = (goal, isSelectValue, removeOptionValue) => {
    if (!goal) {
        goal = {
            avatarUrl: "",
            email: "anonymous@oxgneap.com",
            id: 69420,
            name: "Anonymous",
            role: "member"
        }
    }

    return (
        <>
            <User
                key={goal.id}
                isSelectValue={isSelectValue}
                withBottomMargin={!!removeOptionValue}
            >
                <Avatar avatarUrl={goal.avatarUrl} name={goal.type} size={25} />
                <Username>{goal.title}</Username>
                {removeOptionValue && <Icon type="close" top={1} onClick={() => removeOptionValue && removeOptionValue()} />}
            </User>
        </>
    );
}

export default GoalIssueLink;