/* eslint-disable jsx-a11y/anchor-is-valid */
import clsx from 'clsx'
import {FC, Key, useEffect} from 'react'
import { useAuth } from '../../../../modules/auth'

import { useState } from 'react'
import { editUser } from '../../../../services/firestore'
import { string } from 'yup'
import { getOrgs } from '../../../../services/firestore'
import { DocumentData } from 'firebase/firestore'



const Organisations: FC = () => {
  const {currentUser} = useAuth() 
  const [organisations, setSpaces] = useState<any | null>(currentUser?.all?.orgs);
  const [organisationsC, setSpacesC] = useState<any | null>();

  useEffect(() => {
    let a: (DocumentData | undefined)[] = []
    getOrgs(currentUser?.email)
      .then(spaceData => {
        if (spaceData) {
          spaceData.forEach((doc) => {
            a.push({ [doc.id]: doc.data() })
          });
/*           const orgName = spaceData.data()
          a.push({[value]:orgName?.name}); */
        } else {
        }
      })
      .catch((error) => console.log(error));
      setSpacesC(a)
      {if(currentOrg &&  organisationsC) {console.log(organisationsC[0])}}
 
  }, [])
  const [currentOrg, setcurrentOrg] = useState<any | null>(currentUser?.all?.currentOrg ?? currentUser?.all?.orgs[0]);
  


  const updateUserOrg = (org: any) =>{
    editUser(currentUser,{currentOrg:org})
    setcurrentOrg(org)
  }
  
  return (
    <div
      className='menu-item px-5'
      data-xgn-menu-trigger='hover'
      data-xgn-menu-placement='left-start'
      data-xgn-menu-flip='bottom'
    >
      <a href='#' className='menu-link px-5'>
        <span className='menu-title position-relative'>
          Org
          <span className='fs-8 rounded bg-light px-3 py-2 position-absolute translate-middle-y top-50 end-0 text-truncate'>
            { organisationsC && organisationsC }{' '}
            <img
              className='w-15px h-15px rounded-1 ms-2'
              src=''
              alt='Org Name'
            />
          </span>
        </span>
      </a>

      <div className='menu-sub menu-sub-dropdown w-175px py-4'>
        { organisationsC && organisationsC.map((l:any,index:any) => (
          
          <div
            className='menu-item px-3 text-truncate'
            key={index}
            onClick={() => {
              updateUserOrg(l)
            }}
          >
            <a
              href='#'
              className={clsx('menu-link d-flex px-5', {active: 1 === 1})}//{active: l === currentOrg})}
            >
              <span className='avatar avatar-20px me-4'>
                <img className='rounded-1' src='' alt='Org' />
              </span>
              {l && Object.keys(l).toString()} tets
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}

export {Organisations}
