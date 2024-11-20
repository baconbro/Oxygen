import { sortByNewest } from '../../../utils/javascript';
import Create from './Create';
import Comment from './Comment';
import { Comments } from './Styles';



const ProjectBoardIssueDetailsComments = ({ issue }) => (
  <Comments>
    <h3 className="fw-bold mb-1">Comments</h3>
    <Create issueId={issue.id} />
    {issue.comments && sortByNewest(issue.comments, 'createdAt').map(comment => (
      <Comment key={comment.id} comment={comment}  />
    ))}
  </Comments>
);


export default ProjectBoardIssueDetailsComments;
