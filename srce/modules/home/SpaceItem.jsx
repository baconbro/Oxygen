import React, {useState, useEffect} from 'react';
import { Link } from 'react-router-dom'

import * as FirestoreService from '../App/services/firestore';

import { Avatar } from '../../../components/common';

const SpaceItem = ({org}) => {
    const [spaces, setSpaces] = useState([]);
   
    useEffect(() => {

		FirestoreService.getSpaces(org.toString())
			.then(getspaces => {
				let a = []
				getspaces.forEach((doc) => {
					a.push({ [doc.id]: doc.data() })
				});
				setSpaces(a)
			})
			.catch((error) => console.log(error));


	}, []);
    


    return (
        <>
            {spaces && spaces.map((space, index) => (
                <>
        <Link to={`/project/${Object.keys(space)}`}>
      					<div className="d-flex flex-stack" key={index}>
                          <Avatar avatarUrl="" name={space[Object.keys(space)].title} size={50} className='me-5' />
                          <div className="d-flex align-items-center flex-row-fluid flex-wrap">
                              <div className="flex-grow-1 me-2">
                                  <span className="text-gray-800 text-hover-primary fs-6 fw-bolder">{space[Object.keys(space)].title}</span>
                                  <span className="text-muted fw-bold d-block fs-7">{Object.keys(space)}</span>
                              </div>
                             
                              <span className="btn btn-sm btn-icon btn-bg-light btn-active-color-primary w-30px h-30px">
                                  <span className="svg-icon svg-icon-2">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                          <rect opacity="0.5" x="18" y="13" width="13" height="2" rx="1" transform="rotate(-180 18 13)" fill="black" />
                                          <path d="M15.4343 12.5657L11.25 16.75C10.8358 17.1642 10.8358 17.8358 11.25 18.25C11.6642 18.6642 12.3358 18.6642 12.75 18.25L18.2929 12.7071C18.6834 12.3166 18.6834 11.6834 18.2929 11.2929L12.75 5.75C12.3358 5.33579 11.6642 5.33579 11.25 5.75C10.8358 6.16421 10.8358 6.83579 11.25 7.25L15.4343 11.4343C15.7467 11.7467 15.7467 12.2533 15.4343 12.5657Z" fill="black" />
                                      </svg>
                                  </span>
                              </span>
                             
                          </div>
                      </div>
                      </Link>
                      <div className="separator separator-dashed my-4"></div>
                      </>
                      ))}
                      {(Object.keys(spaces).length == 0)?
                      <div></div>
 
                    :<div></div>
                                        }
      
                      </>

    )
}


export default SpaceItem;