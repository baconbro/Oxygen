import React from 'react';


const Plan = ({users}) => {
    return (
<div className="card mb-5 mb-xl-10">
						
									<div className="card-body">
										<div className="row">
											<div className="col-lg-7">
												<h3 className="mb-2">Free Plan</h3>
												<p className="fs-6 text-gray-600 fw-bold mb-6 mb-lg-15"></p>
										
												<div className="fs-5 mb-2">
													<span className="text-gray-800 fw-bolder me-1">$0</span>
													<span className="text-gray-600 fw-bold">Per Month</span>
												</div>
								
												<div className="fs-6 text-gray-600 fw-bold">Free cloud. Up to 10 users</div>
										
											</div>
								
											<div className="col-lg-5">
									
												<div className="d-flex text-muted fw-bolder fs-5 mb-3">
													<span className="flex-grow-1 text-gray-800">Users</span>
													<span className="text-gray-800">{users} of 10 Used</span>
												</div>
										
												<div className="progress h-8px bg-light-primary mb-2">
													<div className="progress-bar bg-primary" role="progressbar" style={{width: users*10+'%'}}></div>
												</div>
									
												<div className="fs-6 text-gray-600 fw-bold mb-10">{10-users} Users remaining until your plan requires update</div>
										
												<div className="d-flex justify-content-end pb-0 px-0">
													<button className="btn btn-light">Join wishlist to upgrade plan</button>
												</div>
										
											</div>
								
										</div>
							
									</div>
								</div>
    );
};



export default Plan;

