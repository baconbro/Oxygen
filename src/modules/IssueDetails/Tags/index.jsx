import { useState, useCallback } from 'react';
import Tags from "@yaireo/tagify/dist/react.tagify"
import './tagify.css'

const TagsComponent = ({ issue, updateIssue }) => {
  const [tags, setTags] = useState([issue.tags])

  const list = (tags) => {
    var arr = [];
    if (tags) {
      for (let i = 0; i < tags.length; i++) {
        arr.push(tags[i].value);
      }
    }
    return arr;
  }

  const onChange = useCallback(e => {
    console.log({ tags: e.detail.tagify.getCleanValue() })
    updateIssue({ tags: e.detail.tagify.getCleanValue() })
  }, [])

  return (
    <>
      <Tags
        settings={{
          dropdown: {
            enabled: 1
          }
        }}
        defaultValue={list(tags[0]).toString()}
        autoFocus={false}
        whitelist={[]}//from all tags in the organisation
        className="form-control form-control-solid"
        onAdd={onChange}
        onRemove={onChange}
      />
    </>
  )
}



export default TagsComponent;
