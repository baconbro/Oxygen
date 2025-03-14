import { sortByNewest } from '../../../utils/javascript';
import Create from './Create';
import Comment from './Comment';
import { Comments } from './Styles';



const ProjectBoardIssueDetailsComments = ({ issue }) => (
  <Comments>
    <Create issueId={issue.id} />
    {issue.comments && sortByNewest(issue.comments, 'createdAt').map(comment => (
      <Comment key={comment.id} comment={comment}  />
    ))}
  </Comments>
);


export default ProjectBoardIssueDetailsComments;
