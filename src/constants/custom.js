export const customStatus =
{
  IssueStatus: {
    ONTRACK: 'ontrack',
    BEHIND: 'behind',
  ATRISK: 'atrisk',
  PENDING: 'pending',
  COMPLETED: 'completed',
  },
  IssueStatusCopy: {
    ontrack: 'On track',
    behind: 'Behind',
  atrisk: 'At risk',
  pending: 'Pending',
  completed: 'Completed',
  },
  IssueStatusClass: {
    ontrack: 'success',
    behind: 'warning',
  atrisk: 'danger',
  pending: 'secondary',
  completed: 'primary',
  }
}

export   const getScoreColor = (value) => {
    if (value >= 60 && value <= 100) {
      return 'success';
    } else if (value >= 30 && value < 60) {
      return 'warning';
    } else if (value >= 1 && value < 30) {
      return 'danger';
    } else {
      return 'secondary';
    }
  };

  export const goalType =
{
  IssueStatus: {
    STRAT: 'strat',
    OBJ: 'obj',
    KR: 'kr',
  },
  IssueStatusCopy: {
    strat: 'Strategic',
    obj: 'Objective',
    kr: 'Key Result',
  },
  IssueStatusClass: {
    strat: 'light-success',
    obj: 'light-primary',
    kr: 'light-info',
  }
}
