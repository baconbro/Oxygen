import { sortByNewest } from '../../../utils/javascript';
import CommentsCreate from './Create';
import DetailsComment from './Comment';
import { Comments } from './Styles';



const CommentsComponent = ({ issue, updateIssue, object }) => (
  <Comments>
    <CommentsCreate issue={issue} updateIssue={updateIssue} object={object} />
    {issue[object] && sortByNewest(issue[object], 'createdAt').map(comment => (
      <DetailsComment key={comment.id} comment={comment} issue={issue} updateIssue={updateIssue} object={object} />
    ))}
  </Comments>
);


export default CommentsComponent;
