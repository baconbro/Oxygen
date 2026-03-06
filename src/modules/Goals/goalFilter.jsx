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
        <Filters data-testid="board-filters" style={{ display: 'contents' }}>
            <SearchInput
                value={searchTerm}
                onChange={value => mergeFilters({ searchTerm: value })}
                placeholder="Search goals..."
                className="form-control form-control-sm"
                style={{ maxWidth: 200 }}
            />

            <button
                onClick={() => mergeFilters({ recent: !recent })}
                className={`btn btn-sm btn-flex fw-bold ${recent ? 'btn-primary' : 'bg-body btn-color-gray-700 btn-active-color-primary'}`}
            >
                Recently Updated
            </button>
            <button
                onClick={() => mergeFilters({ myOnly: !myOnly })}
                className={`btn btn-sm btn-flex fw-bold ${myOnly ? 'btn-primary' : 'bg-body btn-color-gray-700 btn-active-color-primary'}`}
            >
                My Goals
            </button>
            {!areFiltersCleared && (
                <ClearAll onClick={() => mergeFilters(defaultFilters)}>Clear all</ClearAll>
            )}
        </Filters>
    );
};

export default GoalFilter;
