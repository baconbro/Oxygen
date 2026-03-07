import { InputDebounced } from '../../components/common';
import { useWorkspace } from '../../contexts/WorkspaceProvider';

const GoalFilter = () => {
    const { defaultFilters, filters, mergeFilters } = useWorkspace();
    const { searchTerm, userIds, myOnly, recent, hideOld } = filters;
    const areFiltersCleared = !searchTerm && userIds.length === 0 && !myOnly && !recent && hideOld === 30;

    return (
        <div data-testid="board-filters" style={{ display: 'contents' }}>
            <InputDebounced
                value={searchTerm}
                onChange={value => mergeFilters({ searchTerm: value })}
                placeholder="Search goals..."
                className="form-control form-control-sm mr-[18px]"
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
                <div
                    className="h-[32px] leading-[32px] ml-[15px] pl-[12px] border-l border-gray-200 text-gray-700 text-[14.5px] cursor-pointer hover:text-gray-500 transition-colors"
                    onClick={() => mergeFilters(defaultFilters)}
                >
                    Clear all
                </div>
            )}
        </div>
    );
};

export default GoalFilter;
