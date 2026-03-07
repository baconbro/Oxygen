import { sortByNewest } from '../../../utils/javascript';
import CommentsCreate from './Create';
import DetailsComment from './Comment';




const CommentsComponent = ({ issue, updateIssue, object }) => (
  <div className="pt-[40px]">
    <CommentsCreate issue={issue} updateIssue={updateIssue} object={object} />
    {issue[object] && sortByNewest(issue[object], 'createdAt').map(comment => (
      <DetailsComment key={comment.id} comment={comment} issue={issue} updateIssue={updateIssue} object={object} />
    ))}
  </div>
);


export default CommentsComponent;
