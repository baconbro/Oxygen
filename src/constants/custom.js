export const customStatus =
{
  IssueStatus: {
    ONTRACK: 'ontrack',
    BEHIND: 'behind',
    ATRISK: 'atrisk',
  },
  IssueStatusCopy: {
    ontrack: 'On track',
    behind: 'Behind',
    atrisk: 'At risk',
  },
  IssueStatusClass: {
    ontrack: 'success',
    behind: 'warning',
    atrisk: 'danger',
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
