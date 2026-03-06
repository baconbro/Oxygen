import {
    Filters,
    SearchInput,
    ClearAll,
} from '../Workspace/Board/Filters/Styles';
import { useWorkspace } from '../../contexts/WorkspaceProvider';

const GoalFilter = () => {
    const { defaultFilters, filters, mergeFilters } = useWorkspace();
    const { searchTerm, userIds, myOnly, recent, hideOld } = filters;
    const areFiltersCleared = !searchTerm && userIds.length === 0 && !myOnly && !recent && hideOld === 30;

    return (
        <div className="d-flex flex-wrap flex-stack pb-7">
            <Filters data-testid="board-filters">
                <SearchInput
                    value={searchTerm}
                    onChange={value => mergeFilters({ searchTerm: value })}
                    placeholder="Search goals..."
                    className="form-control"
                />

                <button
                    onClick={() => mergeFilters({ recent: !recent })}
                    className={`btn btn-sm btn-flex fw-bold ms-2 ${recent ? 'btn-primary' : 'bg-body btn-color-gray-700 btn-active-color-primary'}`}
                >
                    Recently Updated
                </button>
                <button
                    onClick={() => mergeFilters({ hideOld: hideOld === 0 ? 30 : 0 })}
                    className={`btn btn-sm btn-flex fw-bold ms-2 ${hideOld === 0 ? 'btn-primary' : 'bg-body btn-color-gray-700 btn-active-color-primary'}`}
                >
                    Show old
                </button>
                {!areFiltersCleared && (
                    <ClearAll onClick={() => mergeFilters(defaultFilters)}>Clear all</ClearAll>
                )}
            </Filters>
        </div>
    );
};

export default GoalFilter;
