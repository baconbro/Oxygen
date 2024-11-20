
import React, { useState, useEffect } from 'react';
import { createQueryParamModalHelpers } from '../../../utils/queryParamModal';
import { Modal } from '../../../components/common';
import Sidebar from './Sidebar';
import Header from '../Org/Header';
import * as FirestoreService from '../App/services/firestore';
import SpaceItem from './SpaceItem'

import Tab from 'react-bootstrap/Tab'
import Nav from 'react-bootstrap/Nav'
import { Link } from 'react-router-dom'
import CreateOrg from './NewOrg';
import CreateSpace from './NewSpace';
import { useAuth } from "../../../contexts/AuthContext"
import { Avatar } from '../../../components/common';

import { getAnalytics, logEvent } from "firebase/analytics";
import SuperAdmin from './SuperAdmin';


const DashboardPage = () => {
	const analytics = getAnalytics();
	logEvent(analytics, 'screen_view', {
	  firebase_screen: "Dashboard",
	  firebase_screen_class: "screenClass"
	});
	const [orgs, setOrgs] = useState();
	const { currentUser } = useAuth()

	useEffect(() => {
		FirestoreService.getOrgs(currentUser.email)
			.then(getOrgs => {
				let a = []
				getOrgs.forEach((doc) => {
					a.push({ [doc.id]: doc.data() })
				});
				setOrgs(a)

			})
			.catch((error) => console.log(error));


	}, []);

	//const issueCreateOrgModalHelpers = createQueryParamModalHelpers('create-org');
	const issueCreateSpaceModalHelpers = createQueryParamModalHelpers('create-space');

	return (
		<div className="page d-flex flex-row flex-column-fluid">
			<div className="wrapper d-flex flex-column flex-row-fluid" id="xgn_wrapper">
				<Header />
				<div className="d-flex flex-column-fluid">
					{orgs && <Sidebar orgs={Object.keys(Object.values(orgs)[0])[0]} />}
					<div className="d-flex flex-column flex-column-fluid container-fluid">

						<div className="content flex-column-fluid" id="xgn_content">
							{/* 								{issueCreateOrgModalHelpers.isOpen() && (
									<Modal
										isOpen
										testid="modal:issue-search"
										variant="aside"
										width={600}
										onClose={issueCreateOrgModalHelpers.close}
										renderContent={() => <CreateOrg modalClose={issueCreateOrgModalHelpers.close} />}
									/>
								)} */}

							{issueCreateSpaceModalHelpers.isOpen() && (
								<Modal
									isOpen
									testid="modal:issue-search"
									width={600}
									className="card card-flush border-0 h-md-100"
									onClose={issueCreateSpaceModalHelpers.close}
									renderContent={() => <CreateSpace modalClose={issueCreateSpaceModalHelpers.close} orgs={orgs} />}
								/>
							)}
							<div className="col-xxl-6">
								<div className="card card-flush mb-xxl-10">
									<div className="card-header pt-5">
										<h3 className="card-title align-items-start flex-column">
											<span className="card-label fw-bolder text-dark">Dashboard</span>
											<span className="text-gray-400 pt-2 fw-bold fs-6"></span>
										</h3>
										<div className="card-toolbar">


											{/* <button className="btn btn-sm btn-light me-2 " onClick={issueCreateOrgModalHelpers.open}><i className="bi bi-plus-square-dotted"></i>Add an new organisation</button> */}

										</div>
									</div>
									<div className="card-body">
										<Tab.Container id="left-tabs-example" defaultActiveKey="first">
											<Nav variant="pills" className="flex-column">
												<ul className="nav nav-pills nav-pills-custom mb-3">
													{orgs && orgs.map((org, index) => (
														<Nav.Item>
															<li className="nav-item mb-3 me-3 me-lg-6">
																<Nav.Link eventKey={Object.keys(org)} className="nav-link d-flex justify-content-between flex-column flex-center overflow-hidden active w-200px h-85px py-4">
																	<div className="nav-icon">
																		<Avatar avatarUrl="" name={org[Object.keys(org)].name} size={50} />
																	</div>
																	<span className="nav-text text-gray-700 fw-bolder fs-6 lh-1">{org[Object.keys(org)].name}</span>
																	<span className="bullet-custom position-absolute bottom-0 w-100 h-4px bg-primary"></span>
																</Nav.Link>
															</li>
														</Nav.Item>
													))}
												</ul>
											</Nav>
											<Tab.Content>
												<div className="tab-content">
													{orgs && orgs.map((org, index) => (
														<Tab.Pane eventKey={Object.keys(org)} active>
															<div className="card card-flush mb-xxl-10">
																<div className="card-header pt-5">
																	<h3 className="card-title align-items-start flex-column">
																		<span className="card-label fw-bolder text-dark">{org[Object.keys(org)].name}</span>
																		<span className="text-gray-400 pt-2 fw-bold fs-6">Workspaces</span>
																	</h3>
																	<div className="card-toolbar">
																	</div>
																</div>
																<div className="card-body">
																	<div className="tab-pane fade show active" id="xgn_stats_widget_1_tab_1">
																		<SpaceItem org={Object.keys(org)} />

																		<a href="#" className="d-flex flex-stack" key={index} onClick={issueCreateSpaceModalHelpers.open}>
																			<i className='bi bi-plus-square-dotted fs-3x me-5'></i>
																			<div className="d-flex align-items-center flex-row-fluid flex-wrap">
																				<div className="flex-grow-1 me-2">
																					<span className="text-gray-800 text-hover-primary fs-6 fw-bolder">Add a new space</span>
																					<span className="text-muted fw-bold d-block fs-7"></span>
																				</div>
																			</div>
																		</a>
																	</div>
																</div>
															</div>
														</Tab.Pane>
													))}

												</div>
											</Tab.Content>
										</Tab.Container>
									</div>
								</div>
							</div>
							<SuperAdmin/>
						</div>
					</div>
				</div>
			</div>
		</div>


	)
}


export { DashboardPage }