import {auth,db,storage} from '/config.js'

(async function init(){
	// await auth.signOut().then(async()=>{
	// 	alert("Done")
		
	// })

	function scroll_on_hover(ele){
		ele.onmouseover=function(){
			ele.style.overflowY='auto'
		}
		ele.onmouseout=function(){
			ele.style.overflowY='hidden'
		}
	}
	
	let minimised=false;
	document.getElementById('minimise').onclick=function(){
		if (!minimised){
			document.getElementById('dash_div').style.width='8vw'
			for (let k of document.querySelectorAll('.dash_btns')){
				if (k.id!='minimise'){
					k.childNodes[2].style.display='none'
					k.childNodes[2].style.transition='0.5s'
				}
			}
			document.getElementById('dash_txt').childNodes[2].style.display='none'
			setTimeout(()=>{
				document.getElementById('minimise_caret').style.transform='rotateZ(180deg)';
				document.getElementById('minimise_caret').style.left='0%'

			},1500)
			minimised=true
		}
		else{
			document.getElementById('dash_div').style.width='20vw'
			setTimeout(()=>{
				document.getElementById('minimise_caret').style.transform='rotateZ(360deg)';
				document.getElementById('minimise_caret').style.left='40%'
			},1500)
			setTimeout(()=>{
				for (let k of document.querySelectorAll('.dash_btns')){
					if (k.id!='minimise'){
						k.childNodes[2].style=''
					}
				}

			},500)
			document.getElementById('dash_txt').childNodes[2].style=''
			
			minimised=false

		}
			

	}
	document.getElementById('townhall').onclick=async function(){
		const servers={
			iceServers:[{
				urls:['stun:stun2.l.google.com:19302']
			}],
			iceCandidatePollSize:150
		}
		
		let videofeed=document.createElement('video')
		videofeed.style='width:50vw;height:50vh;border:1px solid black;transform:rotateY(180deg);'
		videofeed.playsinline=true
		videofeed.autoplay=true
		document.getElementById('widg_cont').appendChild(videofeed)
		let inpid=document.createElement('input')
		inpid.type='text'
		document.getElementById('widg_cont').appendChild(inpid)
		let remotevideofeed=document.createElement('video')
		remotevideofeed.style='width:50vw;height:50vh;border:1px solid black;'
		remotevideofeed.playsinline=true
		remotevideofeed.autoplay=true
		document.getElementById('widg_cont').appendChild(remotevideofeed)
		let create=document.createElement('button')
		create.innerText='Create Meeting'
		document.getElementById('widg_cont').appendChild(create)
		let join=document.createElement('button')
		join.innerText='join Meeting'
		document.getElementById('widg_cont').appendChild(join)
		let connection=new RTCPeerConnection(servers);
		join.onclick=async function(){
			const callId=inpid.value.trim()
			const calldoc=db.collection('townhall').doc(callId)
			const receivers=calldoc.collection("receivers")
			connection.onicecandidate=event => {
				event.candidate && receivers.add(event.candidate.toJSON());
			}
			const calldata=(await calldoc.get()).data();
			const offerdesc=calldoc.offer_dets;
			await connection.setRemoteDescription(new RTCSessionDescription(offerdesc))
			const answerdesc=await connection.createAnswer();
			await connection.setLocalDescription(answerdesc)
			const answer={
				type:answer.type,
				sdp:answer.sdp
			}
			await calldoc.update({answer})
			await calldoc.collection("callers_ice").onSnapshot((snap)=>{
				snap.docChanges().forEach((change)=>{
					if (change.type==='added'){
						let data=change.doc.data()
						connection.addIceCandidate(new RTCIceCandidate(data))
					}
				})
			})


		}
		create.onclick=async function(){
			
			let localstream=await navigator.mediaDevices.getUserMedia({video:true,audio:true})
			connection.ontrack=event => {
				console.log(event)
			}
			connection.onicecandidate=event=>{
				event.candidate
			}

			localstream.getTracks().forEach(item =>{
				console.log(item)
				connection.addTrack(item,localstream)


			})
			videofeed.srcObject=localstream
			const call=await db.collection("townhall").doc()
			const callerice=call.collection("callers_ice")
			const receivers=call.collection("receivers")
			console.log(call.id)
			callerice.onicecandidate=event => {
				event.candidate && callerice.add(event.candidate.toJSON());
			}
			const offer=await connection.createOffer()
			await connection.setLocalDescription(offer)
			const offer_dets={
				type:offer.type,
				sdp:offer.sdp
			}

			await call.set({offer_dets});
			call.onSnapshot((snap)=>{
				const data=snap.data()
				console.log(connection.currentRemoteDescription,data.answer)
				if (!connection.currentRemoteDescription && data.answer){
					const answerdesc=new RTCSessionDescription(data.answer)
					connection.setRemoteDescription(answerdesc)

				}
			})
			receivers.onSnapshot(snapshot => {
				snapshot.docChanges().forEach((change) => {
					if (change.type==='added'){
						const candidate=new RTCIceCandidate(change.doc.data())
						connection.addIceCandidate(candidate)
					}
				})
			})

			/*await db.collection("townhall").doc(call.id).get().then((p)=>{
				let userno;
				for (userno in p.data()){}
				let redump=p.data()
				redump[userno+1]=offer_dets
				
			})*/


		}

	}

	document.getElementById('bulletinboard').onclick=async function(){
		document.getElementById('widg_cont').innerHTML=``
		let header=document.createElement('center')
		
		header.innerHTML='<h1>Bulletin Board</h1>'
		document.getElementById('widg_cont').appendChild(header)
		
		let comuid;
		if (await auth.currentUser.email.split('.').length==3){
			await db.collection('residents').doc(await auth.currentUser.email).get().then(async (user_det)=>{
				comuid=await user_det.data().comuid
			})
		}
		else{
			comuid=await auth.currentUser.email.split('@')[0].split('.')[2]
		}
		if (await auth.currentUser.email.split('.').length==4){
			let create_announce=document.createElement('button')
			create_announce.innerHTML=`<span class='fa fa-solid fa-plus'></span>  Create Announcement`
			create_announce.style='float:right;margin-right:10px;margin-top:10px;'
			create_announce.setAttribute('class','poll_cr')
			document.getElementById('widg_cont').appendChild(document.createElement('br'))
			document.getElementById('widg_cont').appendChild(document.createElement('br'))
			document.getElementById('widg_cont').appendChild(create_announce)
			document.getElementById('widg_cont').appendChild(document.createElement('br'))
			document.getElementById('widg_cont').appendChild(document.createElement('br'))
			document.getElementById('widg_cont').appendChild(document.createElement('br'))
			create_announce.onclick=async function(){
				document.getElementById('widg_cont').innerHTML=``
				document.getElementById('widg_cont').appendChild(document.createElement('br'))
				document.getElementById('widg_cont').appendChild(document.createElement('br'))
				document.getElementById('widg_cont').appendChild(document.createElement('br'))
				let backbtn=document.createElement('button')
				backbtn.innerHTML=`<span class='fa fa-solid fa-left-long'></span>`
				backbtn.style='margin-left:40px;margin-top:10px;float:left;'
				backbtn.onclick=function(){
					document.getElementById('widg_cont').innerHTML=``
					document.getElementById('bulletinboard').click()
				}
				backbtn.setAttribute('class','backbtn')
				document.getElementById('widg_cont').appendChild(backbtn)
				document.getElementById('widg_cont').appendChild(document.createElement('br'))
				document.getElementById('widg_cont').appendChild(document.createElement('br'))
				document.getElementById('widg_cont').appendChild(document.createElement('br'))
				document.getElementById('widg_cont').appendChild(document.createElement('br'))
				let announcediv=document.createElement('div')
				announcediv.style='margin:auto;width:90%;background:whitesmoke;border:2px dashed black;'
				announcediv.innerHTML=`
					<center><h3>Make Announcements to your community</h3></center>
					<br><br>
					<div class='inputbox' style='margin-left:15px;width:35vw;'>
						<input required id='subject'>
						<label>Subject of Announcement</label>
					</div>
					<br>
					<div class='inputbox' style='margin-left:15px;width:35vw;'>
						<input required id='dop' onfocus='(this.type="date")' onfocusout='(this.type="text")'>
						<label>Date to publish</label>
					</div>
					<br>
					
					<textarea id='content' style='font-family:Montserrat;margin-left:15px;width:40vw;height:20vh;border-radius:8px;outline:none;resize:none;' placeholder='Enter content of Announcement'></textarea>
					<br><br>
					<center><button id='announce' class='submitpoll'><span class='fa fa-solid fa-bullhorn'></span>  Publish Announcement</button></center>
					<br><br>
				`
				document.getElementById('widg_cont').appendChild(announcediv)
				document.getElementById('announce').onclick=async function(){
					let entries=['dop','subject','content']
					let c=0;
					for (let lp of entries){
						if (document.getElementById(lp).value.trim().length==0){
							alert("All fields are mandatory")
							document.getElementById(lp).style.border='1px solid red'
						}
						else{
							document.getElementById(lp).style.border='1px solid black'
							c++;
						}
					}
					if (c==entries.length){
						document.getElementById('announce').innerHTML=`<span class='fa fa-solid fa-hourglass' style='animation-name:rotate_360;animation-fill-mode:forwards;animation-duration:1s;animation-iteration-count:infinite;'></span>`
						
						let name,designation
						await db.collection('admins').doc(await auth.currentUser.email).get().then(async u =>{
							name=u.data().name 
							designation=u.data().designation

						})
						let comuid=await auth.currentUser.email.split('@')[0].split('.')[2]
						let db_store_obj={
							dop:document.getElementById('dop').value,
							content:document.getElementById('content').value,
							subject:document.getElementById('subject').value.trim(),
							published_name:name,
							published_desig:designation,
							comuid:comuid
						}
						await db.collection('bulletin_board').doc().set(db_store_obj).then(()=>{
							alert("Announcement uploaded successfully\nKindly note that the announcement will be made public\nonly after "+document.getElementById('dop').value)
							document.getElementById('announce').innerHTML=`<span class='fa fa-solid fa-bullhorn'></span> Publish Announcement`;
						})

					}
				}
			}
		}
		let announcetbl=document.createElement('div')
		announcetbl.style='width:90%;margin:auto;max-height:70vh;overflow-y:auto;'
		announcetbl.innerHTML=`
			<table id='announcetbl' style='width:100%;border-collapse:collapse;'>
				<tr>
					<td style='height:10vh;width:20%;border:1px solid white;background:blue;color:white;font-family:Montserrat;'><center>Posted By</center></td>
					<td style='height:10vh;width:20%;border:1px solid white;background:blue;color:white;font-family:Montserrat;'><center>Posted On</center></td>
					<td style='height:10vh;width:20%;border:1px solid white;background:blue;color:white;font-family:Montserrat;'><center>Subject</center></td>
					<td style='height:10vh;width:40%;border:1px solid white;background:blue;color:white;font-family:Montserrat;'><center>Content</center></td>
				</tr>
			</table>
		`;
		document.getElementById('widg_cont').appendChild(announcetbl)
		await db.collection("bulletin_board").onSnapshot((snap)=>{
			snap.docs.map(async (ht) =>{
				if (ht.data().comuid==comuid){
					let data=await ht.data()
					let annrows=document.createElement('tr')
					annrows.innerHTML=`
						<td style='height:15vh;border:1px solid black;font-family:Montserrat;'><center>Name: `+data.published_name+`</center><br><center>Designation: `+data.published_desig+`</center></td>
						<td style='height:15vh;border:1px solid black;font-family:Montserrat;'><center>`+data.dop+`</center></td>
						<td style='height:15vh;border:1px solid black;font-family:Montserrat;'><center>`+data.subject+`</center></td>
						<td style='height:15vh;border:1px solid black;font-family:Montserrat;'><center><textarea style='resize:none;width:90%;height:12vh;' disabled>`+data.content+`</textarea></center></td>
					`
					document.getElementById('announcetbl').appendChild(annrows)

				}
			})
		})


	}
	
	document.getElementById('admins_view').onclick=async function(){
		document.getElementById('widg_cont').innerHTML=``
		let office_bearer_tbl=document.createElement('table')
		office_bearer_tbl.style='width:95%;height:100%;border-collapse:collapse;margin:auto;'
		office_bearer_tbl.innerHTML=`
			<tr>
				<th style='width:25%;height:8vh;font-family:Josefin;color:white;border:1px solid white;font-size:20px;font-weight:520;background:#297ff0;'>Name</th>
				<th style='width:25%;height:8vh;font-family:Josefin;color:white;border:1px solid white;font-size:20px;font-weight:520;background:#297ff0;'>Designation</th>
				<th style='width:25%;height:8vh;font-family:Josefin;color:white;border:1px solid white;font-size:20px;font-weight:520;background:#297ff0;'>Phone Number</th>
				<th style='width:25%;height:8vh;font-family:Josefin;color:white;border:1px solid white;font-size:20px;font-weight:520;background:#297ff0;'>Email ID</th>
			</tr>

			
		`;
		await db.collection('admins').get().then(async (r)=> {
			await r.docs.map(async(g) => {
				let extract_UID=await auth.currentUser.email.split('@')[0].split('.')[1]
				let extract_UID_admin=await auth.currentUser.email.split('@')[0].split('.')[2]
				if (g.id.split('.')[2].includes(extract_UID) || g.id.split('.')[2].includes(extract_UID_admin)){
					office_bearer_tbl.innerHTML+=`
						<tr>
							<td style='width:25%;font-family:Josefin;border:1px solid black;font-weight:520;height:10vh;'><center>`+g.data().name+`</center></td>
							<td style='width:25%;font-family:Josefin;border:1px solid black;font-weight:520;height:10vh;'><center>`+g.data().designation+`</center></td>
							<td style='width:25%;font-family:Josefin;border:1px solid black;font-weight:520;height:10vh;'><center><acronym title='Click to Copy' class='tocopy'>`+g.data().phno+`</acronym></center></td>
							<td style='width:25%;font-family:Josefin;border:1px solid black;font-weight:520;height:10vh;'><center><acronym title='Click to Copy' class='tocopy'>`+g.data().mailid+`</acronym></center></td>
						</tr>
					`
				}

			})
		})
		document.getElementById('widg_cont').appendChild(office_bearer_tbl)
		let copier=document.querySelectorAll('.tocopy')
		for (let element of copier){
			element.onclick=function(){
				navigator.clipboard.writeText(element.innerHTML)
				alert("Text copied")
			}
		}
	}

	scroll_on_hover(document.getElementById('dash_div'))
	document.getElementById('visit_approve').onclick=async function(){
		if (await auth.currentUser.email.split('.').length==3){
			document.getElementById('widg_cont').innerHTML=``
			let pre_approve_dets={photo_prev:'',name:'',desc:'',dov:'',tov:''}
			document.getElementById('widg_cont').appendChild(document.createElement('br'))
			let view_approve_div=document.createElement('div')
			view_approve_div.style='margin:auto;width:70vw;border-radius:8px;border:2px solid black;background:whitesmoke;'
			view_approve_div.innerHTML=`
				<center><h2>Visitor Pre - Approval</h2></center>
				<br>
				<div style='width:100%;height:100%;display:flex;justify-content:space-evenly;'>
					<div>
						<div class='inputbox' style='width:30vw;margin-left:50px;'>
							<input required id='name'>
							<label>Name of Visitor</label>
						</div>
						<br>
						<textarea id='desc' style='margin-left:50px;width:30vw;height:25vh;resize:none;border-radius:5px;' placeholder='Description of Visitor (Optional)'></textarea>
						<br><br>
						<div class='inputbox' style='width:30vw;margin-left:50px;'>
							<input onfocus='(this.type="date")' onfocusout='(this.type="text")' required id='dov'>
							<label>Date of Visit</label>
						</div>
						<br><br>
						<div class='inputbox' style='width:30vw;margin-left:50px;'>
							<input onfocus='(this.type="time")' onfocusout='(this.type="text")' required id='tov'>
							<label>Expected Time of Visit (24-hr format)</label>
						</div>
					</div>
					<div>
						<center><img id='photo_prev' style='width:10vw;height:20vh;border:2px dashed black;background:whitesmoke;border-radius:8px;'>
							
						</center>
						<br><br>
						<center><button id='visitor_photo' style='font-family:Josefin;border-radius:8px;border-width:0.2px;height:5vh;'>Upload Picture</button></center>
					</div>
				</div>
				<br><br>
				<center><button id='updets'>Upload Details</button></center>
				<br><br>


				
			`;
			document.getElementById('widg_cont').appendChild(view_approve_div)
			document.getElementById('updets').onclick=async function(){
				let mandate=["name",'dov','tov']
				let manc=0;
				for (let mans of mandate){
					if (document.getElementById(mans).value.trim().length==0){
						alert('All fields are mandatory')
						document.getElementById(mans).style.border='1px solid red'
						break;
					}
					else{
						document.getElementById(mans).style.border='1px solid black'
						pre_approve_dets[mans]=document.getElementById(mans).value.trim()
						manc++;
					}
				}
				pre_approve_dets.desc=document.getElementById('desc').value;
				document.getElementById('updets').innerHTML=`<span class='fa fa-solid fa-hourglass' style='animation-name:rotate_360;animation-fill-mode:forwards;animation-duration:1s;animation-iteration-count:infinite;'></span>`
					
				let requester={}
				await db.collection('residents').doc(await auth.currentUser.email).get().then(async (r)=>{
					let received_data=await r.data()
					for (let keys in received_data){
						if (keys!='add' && keys!='mailid'){
							requester[keys]=received_data[keys]
						}
					}
				})
				let docid;
				await db.collection('vp_approval').add({await:true}).then(async(g)=>{
					docid=await g.id
				})
				let visitor_photo='';
				if (pre_approve_dets.photo_prev!=''){
					await storage.ref().child(docid).put(pre_approve_dets.photo_prev).then(async(r)=>{
						visitor_photo=await r.task.snapshot.ref.getDownloadURL()
					})
				}
				
				
				if (manc===mandate.length){
					let vp_approval_data={
						req_uid:await auth.currentUser.email,
						req_comuid:requester.comuid,
						req_name:requester.name,
						req_floor:requester.floor,
						req_block:requester.block,
						req_dno:requester.d_no,
						visitor_name:pre_approve_dets.name,
						visitor_desc:pre_approve_dets.desc,
						visitor_photo:visitor_photo,
						dov:pre_approve_dets.dov,
						tov:pre_approve_dets.tov


					}
					await db.collection('vp_approval').doc(docid).set(vp_approval_data).then(()=>{
						alert('Approval request updated successfully')
						document.getElementById('updets').innerHTML='Upload Details'
					})


					

				}
			}
			document.getElementById('visitor_photo').onclick=function(){
				
				let file_fetcher=document.createElement('input')
				file_fetcher.type='file'
				
				file_fetcher.onchange=async function({target}){
					pre_approve_dets.photo_prev=target.files[0]
					const file_reader=new FileReader()
					file_reader.readAsDataURL(target.files[0])
					file_reader.addEventListener('load',()=>{
						document.getElementById('photo_prev').src=file_reader.result
					})
					
					// await storage.ref().child('checking').put(e.target.files[0]).then(async(r)=>{
					// 	console.log(await r.task.snapshot.ref.getDownloadURL())
					// })
					
				}
				file_fetcher.click()
				
				
			}
		}
		else if(await auth.currentUser.email.split('.').length==4 && await auth.currentUser.email.split('.')[1]=='security'){
			let pre_approve_reqs_div=document.createElement('div')
			pre_approve_reqs_div.style='width:95%;margin:auto;max-height:60vh;overflow-y:auto;'
			pre_approve_reqs_div.innerHTML=`
				<table style='width:100%;border-collapse:collapse;' id='approvalreqtbl'>
					<tr>
						
						<td style='width:14.28%;background:#037bfc;color:white;border:1px solid white;height:8vh;font-family:Montserrat;font-weight:500;'><center>Visitor Name</center></td>
						<td style='width:14.28%;background:#037bfc;color:white;border:1px solid white;height:8vh;font-family:Montserrat;font-weight:500;'><center>Expected Date of <br>Visit</center></td>
						<td style='width:14.28%;background:#037bfc;color:white;border:1px solid white;height:8vh;font-family:Montserrat;font-weight:500;'><center>Expected time of <br>Visit</center></td>
						<td style='width:14.28%;background:#037bfc;color:white;border:1px solid white;height:8vh;font-family:Montserrat;font-weight:500;'><center>Requested <br>Block No</center></td>
						<td style='width:14.28%;background:#037bfc;color:white;border:1px solid white;height:8vh;font-family:Montserrat;font-weight:500;'><center>Requested <br>Floor No</center></td>
						<td style='width:14.28%;background:#037bfc;color:white;border:1px solid white;height:8vh;font-family:Montserrat;font-weight:500;'><center>Requested <br>Door No</center></td>
						<td style='width:14.28%;background:#037bfc;color:white;border:1px solid white;height:8vh;font-family:Montserrat;font-weight:500;'><center>Action</center></td>
					</tr>

				</table>


			` 
			document.getElementById('widg_cont').appendChild(pre_approve_reqs_div)
			await db.collection("vp_approval").onSnapshot(async (nc)=>{
				document.getElementById('approvalreqtbl').innerHTML=`
					<tr>
						
						<td style='width:15%;background:#037bfc;color:white;border:1px solid white;height:8vh;font-family:Montserrat;font-weight:500;'><center>Visitor Name</center></td>
						<td style='width:12.5%;background:#037bfc;color:white;border:1px solid white;height:8vh;font-family:Montserrat;font-weight:500;'><center>Expected Date of <br>Visit</center></td>
						<td style='width:12.5%;background:#037bfc;color:white;border:1px solid white;height:8vh;font-family:Montserrat;font-weight:500;'><center>Expected time of <br>Visit</center></td>
						<td style='width:12.5%;background:#037bfc;color:white;border:1px solid white;height:8vh;font-family:Montserrat;font-weight:500;'><center>Requested <br>Block No</center></td>
						<td style='width:12.5%;background:#037bfc;color:white;border:1px solid white;height:8vh;font-family:Montserrat;font-weight:500;'><center>Requested <br>Floor No</center></td>
						<td style='width:12.5%;background:#037bfc;color:white;border:1px solid white;height:8vh;font-family:Montserrat;font-weight:500;'><center>Requested <br>Door No</center></td>
						<td style='width:12.5%;background:#037bfc;color:white;border:1px solid white;height:8vh;font-family:Montserrat;font-weight:500;'><center>Status</center></td>
						<td style='width:10%;background:#037bfc;color:white;border:1px solid white;height:8vh;font-family:Montserrat;font-weight:500;'><center>Action</center></td>
					</tr>

				`
				nc.docs.map(async(ty)=>{
					//console.log(await auth.currentUser.email.split('.')[2],ty.data().req_comuid)
					if (await auth.currentUser.email.split('.')[2].split('@')[0]==ty.data().req_comuid){
						let reqtr=document.createElement('tr')
						reqtr.setAttribute('class','reqtr')
						let dbdata=await ty.data()
						let currdate=new Date()
						currdate=currdate.getFullYear().toString()+'-'+(parseInt(currdate.getMonth())+1).toString().padStart(2,'0')+'-'+currdate.getDate().toString().padStart(2,'0')
						
						if (ty.data().dov<currdate){
							reqtr.innerHTML=`
								<td style='border:1px solid black;'><center>`+dbdata.visitor_name+`</center></td>
								<td style='border:1px solid black;'><center>`+dbdata.dov+`</center></td>
								<td style='border:1px solid black;'><center>`+dbdata.tov+`</center></td>
								<td style='border:1px solid black;'><center>`+dbdata.req_block+`</center></td>
								<td style='border:1px solid black;'><center>`+dbdata.req_floor+`</center></td>
								<td style='border:1px solid black;'><center>`+dbdata.req_dno+`</center></td>
								<td style='border:1px solid black;'><center><h3 style='color:red;'>Expired</h3></center></td>
								<td style='border:1px solid black;'>
										<center><button id='approve`+ty.id+`' class='approveopts' disabled><span style='color:green;' class='fa fa-solid fa-check'></span>  Approve</button></center>
										<center><button id='decline`+ty.id+`' class='approveopts' disabled><span style='color:red;' class='fa fa-solid fa-xmark'></span>  Decline</button></center>
										<center><button id='view`+ty.id+`' class='approveopts'><span style='color:navy;' class='fa fa-solid fa-eye'></span>  View</button></center>


								</td>
							`
							if (ty.data().approval_status=='Approved'){
								reqtr.innerHTML=`
								<td style='border:1px solid black;'><center>`+dbdata.visitor_name+`</center></td>
								<td style='border:1px solid black;'><center>`+dbdata.dov+`</center></td>
								<td style='border:1px solid black;'><center>`+dbdata.tov+`</center></td>
								<td style='border:1px solid black;'><center>`+dbdata.req_block+`</center></td>
								<td style='border:1px solid black;'><center>`+dbdata.req_floor+`</center></td>
								<td style='border:1px solid black;'><center>`+dbdata.req_dno+`</center></td>
								<td style='border:1px solid black;'><center><h3 style='color:green;'>Approved</h3></center></td>
								<td style='border:1px solid black;'>
										<center><button id='approve`+ty.id+`' class='approveopts' disabled><span style='color:green;' class='fa fa-solid fa-check'></span>  Approve</button></center>
										<center><button id='decline`+ty.id+`' class='approveopts' disabled><span style='color:red;' class='fa fa-solid fa-xmark'></span>  Decline</button></center>
										<center><button id='view`+ty.id+`' class='approveopts'><span style='color:navy;' class='fa fa-solid fa-eye'></span>  View</button></center>


								</td>
							`

							}
							if (ty.data().approval_status=='Declined'){
								reqtr.innerHTML=`
								<td style='border:1px solid black;'><center>`+dbdata.visitor_name+`</center></td>
								<td style='border:1px solid black;'><center>`+dbdata.dov+`</center></td>
								<td style='border:1px solid black;'><center>`+dbdata.tov+`</center></td>
								<td style='border:1px solid black;'><center>`+dbdata.req_block+`</center></td>
								<td style='border:1px solid black;'><center>`+dbdata.req_floor+`</center></td>
								<td style='border:1px solid black;'><center>`+dbdata.req_dno+`</center></td>
								<td style='border:1px solid black;'><center><h3 style='color:#880808;'>Declined</h3></center></td>
								<td style='border:1px solid black;'>
										<center><button id='approve`+ty.id+`' class='approveopts' disabled><span style='color:green;' class='fa fa-solid fa-check'></span>  Approve</button></center>
										<center><button id='decline`+ty.id+`' class='approveopts' disabled><span style='color:red;' class='fa fa-solid fa-xmark'></span>  Decline</button></center>
										<center><button id='view`+ty.id+`' class='approveopts'><span style='color:navy;' class='fa fa-solid fa-eye'></span>  View</button></center>


								</td>
							`
							}

						}
						else{
							if (ty.data().approval_status=='Approved'){
								reqtr.innerHTML=`
									<td style='border:1px solid black;'><center>`+dbdata.visitor_name+`</center></td>
									<td style='border:1px solid black;'><center>`+dbdata.dov+`</center></td>
									<td style='border:1px solid black;'><center>`+dbdata.tov+`</center></td>
									<td style='border:1px solid black;'><center>`+dbdata.req_block+`</center></td>
									<td style='border:1px solid black;'><center>`+dbdata.req_floor+`</center></td>
									<td style='border:1px solid black;'><center>`+dbdata.req_dno+`</center></td>
									<td style='border:1px solid black;'><center><h3 style='color:green;'>Approved</h3></center></td>
									<td style='border:1px solid black;'>
											<center><button id='approve`+ty.id+`' class='approveopts'><span style='color:green;' class='fa fa-solid fa-check'></span>  Approve</button></center>
											<center><button id='decline`+ty.id+`' class='approveopts'><span style='color:red;' class='fa fa-solid fa-xmark'></span>  Decline</button></center>
											<center><button id='view`+ty.id+`' class='approveopts'><span style='color:navy;' class='fa fa-solid fa-eye'></span>  View</button></center>


									</td>
								`
							}
							else if (ty.data().approval_status=='Declined'){
								reqtr.innerHTML=`
									<td style='border:1px solid black;'><center>`+dbdata.visitor_name+`</center></td>
									<td style='border:1px solid black;'><center>`+dbdata.dov+`</center></td>
									<td style='border:1px solid black;'><center>`+dbdata.tov+`</center></td>
									<td style='border:1px solid black;'><center>`+dbdata.req_block+`</center></td>
									<td style='border:1px solid black;'><center>`+dbdata.req_floor+`</center></td>
									<td style='border:1px solid black;'><center>`+dbdata.req_dno+`</center></td>
									<td style='border:1px solid black;'><center><h3 style='color:#880808;'>Declined</h3></center></td>
									<td style='border:1px solid black;'>
											<center><button id='approve`+ty.id+`' class='approveopts'><span style='color:green;' class='fa fa-solid fa-check'></span>  Approve</button></center>
											<center><button id='decline`+ty.id+`' class='approveopts'><span style='color:red;' class='fa fa-solid fa-xmark'></span>  Decline</button></center>
											<center><button id='view`+ty.id+`' class='approveopts'><span style='color:navy;' class='fa fa-solid fa-eye'></span>  View</button></center>


									</td>
								`
							}
							else{
								reqtr.innerHTML=`
									<td style='border:1px solid black;'><center>`+dbdata.visitor_name+`</center></td>
									<td style='border:1px solid black;'><center>`+dbdata.dov+`</center></td>
									<td style='border:1px solid black;'><center>`+dbdata.tov+`</center></td>
									<td style='border:1px solid black;'><center>`+dbdata.req_block+`</center></td>
									<td style='border:1px solid black;'><center>`+dbdata.req_floor+`</center></td>
									<td style='border:1px solid black;'><center>`+dbdata.req_dno+`</center></td>
									<td style='border:1px solid black;'><center><h3 style='color:blue;'>Active</h3></center></td>
									<td style='border:1px solid black;'>
											<center><button id='approve`+ty.id+`' class='approveopts'><span style='color:green;' class='fa fa-solid fa-check'></span>  Approve</button></center>
											<center><button id='decline`+ty.id+`' class='approveopts'><span style='color:red;' class='fa fa-solid fa-xmark'></span>  Decline</button></center>
											<center><button id='view`+ty.id+`' class='approveopts'><span style='color:navy;' class='fa fa-solid fa-eye'></span>  View</button></center>


									</td>
								`


							}
						}
						document.getElementById('approvalreqtbl').appendChild(reqtr)
						
						if(ty.data().approval_status!=undefined){
							if (ty.data().approval_status=='Approved'){
								document.getElementById('approve'+ty.id).disabled=true
								document.getElementById('approve'+ty.id).style='background:#bbe6a1;border-radius:8px;'
								document.getElementById('approve'+ty.id).innerHTML=`<span style='color:green;' class='fa fa-solid fa-check'></span>  Approved`
							}
							else{
								document.getElementById('decline'+ty.id).disabled=true
								document.getElementById('decline'+ty.id).style='background:#e6a1b8;border-radius:8px;'
								document.getElementById('decline'+ty.id).innerHTML=`<span style='color:red;' class='fa fa-solid fa-xmark'></span>  Declined`
							}



						}
						document.getElementById('decline'+ty.id).onclick=async function(){
							try{
								document.getElementById('viewvpdiv').remove()
								for (let br_ of document.getElementsByClassName('vpreqviewbr')){
									br_.remove()
								}

							}
							catch(err){}
							try{
								document.getElementById('declinediv').remove()
								for (let br_ of document.getElementsByClassName('vpreqviewbr')){
									br_.remove()
								}
							}
							catch(err){}
							let reqbr=document.createElement('br')
							reqbr.setAttribute('class','vpreqviewbr')
							document.getElementById('widg_cont').appendChild(reqbr)
							document.getElementById('widg_cont').appendChild(reqbr)
							let declinediv=document.createElement('div')
							declinediv.id='declinediv'
							declinediv.style='width:95%;display:flex;justify-content:space-evenly;margin:auto;border:2px dashed black;border-radius:8px;'
							declinediv.innerHTML=`
								<div>
									<center><h3><u>Requestor Details</u></h3></center>
									<h3>Requestor Name: `+dbdata.req_name+`</h3>
									<h3>Requestor Block No.: `+dbdata.req_block+`</h3>
									<h3>Requestor Floor No.: `+dbdata.req_floor+`</h3>
									<h3>Requestor Door No.: `+dbdata.req_dno+`</h3>
								</div>
								<div style='display:flex;justify-content:space-evenly;'>
									<div>
										<center><h3><u>Visitor Details</u></h3></center>
										<h3>Visitor Name: `+dbdata.visitor_name+`</h3>
										<h3>Date of Visit: `+dbdata.dov+`</h3>
										<h3>Time of Visit: `+dbdata.tov+`</h3>
										<textarea style='border-radius:8px;height:10vh;width:15vw;resize:none;'>`+dbdata.visitor_desc+`</textarea>
										<br><br>
									</div>
									<img style='margin-top:10px;margin-left:25px;border-width:0.2px;border-radius:8px;width:150px;height:150px;' alt='Visitor's Photo' src='`+dbdata.visitor_photo+`'>



								</div>
								<div>
									<br><br>
									<center><textarea id='reasontxt' style='outline:none;resize:none;margin-right:5px;width:15vw;height:20vh;border-radius:8px;' placeholder='Enter reason for declining request'></textarea></center>
									<br>
									<center><button class='updatereason' id='updreason`+ty.id+`'><span class='fa fa-solid fa-upload'></span>  Update reason</button></center>

								</div>
								<button style='float:right;' id='closedeclinevpreq' class='close'><span class='fa fa-solid fa-xmark'></span></button>

							`
							document.getElementById('widg_cont').appendChild(declinediv)
							let gapbr=document.createElement('br')
							gapbr.setAttribute('class','vpreqviewbr')
							document.getElementById('widg_cont').appendChild(gapbr)
							document.getElementById('widg_cont').appendChild(gapbr)
							declinediv.scrollIntoView({behavior:'smooth',block:'center',inline:'center'})
							document.getElementById('closedeclinevpreq').onclick=function(){
								try{
									document.getElementById('declinediv').remove()
									for (let br_ of document.getElementsByClassName('vpreqviewbr')){
										br_.remove()
									}
								}
								catch(err){}
							}
							document.getElementById('updreason'+ty.id).onclick=async function(){
								document.getElementById('updreason'+ty.id).innerHTML=`<span class='fa fa-solid fa-hourglass' style='animation-name:rotate_360;animation-duration:1s;animation-fill-mode:forwards;animation-iteration-count:infinite;'></span>`
								await db.collection("vp_approval").doc(ty.id).update({reason:document.getElementById('reasontxt').value,approval_status:'Declined'})
								document.getElementById('updreason'+ty.id).innerHTML=`<span class='fa fa-solid fa-upload'></span>  Update reason`
								alert("Reason updated")


							}

						}
						
						
						document.getElementById('approve'+ty.id).onclick=async function(){
							try{
								document.getElementById('viewvpdiv').remove()
								for (let br_ of document.getElementsByClassName('vpreqviewbr')){
									br_.remove()
								}

							}
							catch(err){}
							try{
								document.getElementById('declinediv').remove()
								for (let br_ of document.getElementsByClassName('vpreqviewbr')){
									br_.remove()
								}
							}
							catch(err){}
							await db.collection('vp_approval').doc(ty.id).update({reson:"Visitor Approved",approval_status:'Approved'})
							alert("Request approved Successfully")
							document.getElementById('approve'+ty.id).disabled=true
							document.getElementById('approve'+ty.id).style='background:#bbe6a1;border-radius:8px;color:navy;'
							document.getElementById('approve'+ty.id).innerHTML=`<span style='color:green;' class='fa fa-solid fa-check'></span>  Approved`

						}
						document.getElementById('view'+ty.id).onclick=function(){
							try{
								document.getElementById('viewvpdiv').remove()
								for (let br_ of document.getElementsByClassName('vpreqviewbr')){
									br_.remove()
								}

							}
							catch(err){}
							try{
								document.getElementById('declinediv').remove()
								for (let br_ of document.getElementsByClassName('vpreqviewbr')){
									br_.remove()
								}
							}
							catch(err){}
							let reqbr=document.createElement('br')
							reqbr.setAttribute('class','vpreqviewbr')
							document.getElementById('widg_cont').appendChild(reqbr)
							document.getElementById('widg_cont').appendChild(reqbr)
							let viewvpdiv=document.createElement('div')
							viewvpdiv.id='viewvpdiv'
							viewvpdiv.style='width:95%;display:flex;justify-content:space-evenly;margin:auto;border:2px dashed black;border-radius:8px;'
							viewvpdiv.innerHTML=`

								<div>
									<center><h3><u>Requestor Details</u></h3></center>
									<h3>Requestor Name: `+dbdata.req_name+`</h3>
									<h3>Requestor Block No.: `+dbdata.req_block+`</h3>
									<h3>Requestor Floor No.: `+dbdata.req_floor+`</h3>
									<h3>Requestor Door No.: `+dbdata.req_dno+`</h3>
								</div>
								<div style='display:flex;justify-content:space-evenly;'>
									<div>
										<center><h3><u>Visitor Details</u></h3></center>
										<h3>Visitor Name: `+dbdata.visitor_name+`</h3>
										<h3>Date of Visit: `+dbdata.dov+`</h3>
										<h3>Time of Visit: `+dbdata.tov+`</h3>
										<textarea style='border-radius:8px;height:10vh;width:15vw;resize:none;'>`+dbdata.visitor_desc+`</textarea>
										<br><br>
									</div>
									<img style='margin-top:10px;margin-left:25px;border-width:0.2px;border-radius:8px;width:150px;height:150px;' alt='Visitor's Photo' src='`+dbdata.visitor_photo+`'>



								</div>
								<button style='float:right;' id='closeviewvpreq' class='close'><span class='fa fa-solid fa-xmark'></span></button>

							`
							document.getElementById('widg_cont').appendChild(viewvpdiv)
							let gapbr=document.createElement('br')
							gapbr.setAttribute('class','vpreqviewbr')
							document.getElementById('widg_cont').appendChild(gapbr)
							document.getElementById('widg_cont').appendChild(gapbr)
							viewvpdiv.scrollIntoView({behavior:'smooth',block:'center',inline:'center'})
							document.getElementById('closeviewvpreq').onclick=function(){
								try{
									document.getElementById('viewvpdiv').remove()
									for (let br_ of document.getElementsByClassName('vpreqviewbr')){
										br_.remove()
									}

								}
								catch(err){}

							}


						}

						
					}

				})
			})


		}
	}
	document.getElementById('phonedir').onclick=async function(){
		document.getElementById('widg_cont').innerHTML=``
		var dirdiv=document.createElement('div')
		dirdiv.style='width:100%;height:90vh;max-height:90vh;overflow-y:auto;'
		dirdiv.innerHTML=`
			<table id='bltin_board' style='margin:auto;width:90%;border-collapse:collapse;'>
				<tr>
					<th style='width:20%;height:10vh;border:1px solid white;background:blue;color:white'><center>Name</center></th>
					<th style='width:20%;height:10vh;border:1px solid white;background:blue;color:white'><center>Block No.</center></th>
					<th style='width:20%;height:10vh;border:1px solid white;background:blue;color:white'><center>Door No.</center></th>
					<th style='width:20%;height:10vh;border:1px solid white;background:blue;color:white'><center>Floor</center></th>
					<th style='width:20%;height:10vh;border:1px solid white;background:blue;color:white'><center>Phone No.</center></th>
				</tr>
			</table>
		`;
		document.getElementById('widg_cont').appendChild(dirdiv);
		//Getting COM_UID
		let comuid;
		if (await auth.currentUser.email.split('.').length==3){
			await db.collection('residents').doc(await auth.currentUser.email).get().then(async (user_det)=>{
				comuid=await user_det.data().comuid
			})
		}
		else{
			comuid=await auth.currentUser.email.split('@')[0].split('.')[2]
		}
		await db.collection('residents').get().then(async (doc)=>{
			doc.docs.map(async(pairs)=>{
				if (comuid==await pairs.data().comuid){
					//console.log(pairs.data())
					var data=await pairs.data()
					var row=document.createElement('tr')
					row.innerHTML=`
						<td style='border:1px solid black;height:10vh;'><center><h2 style='font-weight:500;'>`+data.name+`</h2></center></td>
						<td style='border:1px solid black;height:10vh;'><center><h2 style='font-weight:500;'>`+data.block+`</h2></center></td>
						<td style='border:1px solid black;height:10vh;'><center><h2 style='font-weight:500;'>`+data.d_no+`</h2></center></td>
						<td style='border:1px solid black;height:10vh;'><center><h2 style='font-weight:500;'>`+data.floor+`</h2></center></td>
						<td style='border:1px solid black;height:10vh;'><center><h2 style='font-weight:500;'>`+data.phno+`</h2></center></td>

					`
					document.getElementById('bltin_board').appendChild(row)
				}
			})
		})
	}
	document.getElementById('polls').onclick=async function(){
		document.getElementById('widg_cont').innerHTML=``
		let polldiv=document.createElement('div')
		polldiv.style='margin:auto;width:90%;max-height:90vh;overflow-y:auto;transition:0.5s;'
		polldiv.innerHTML=`
			<br>
			<button class='poll_cr' id='poll_cr' style='float:right;'><span class='fa fa-solid fa-plus'></span> Create Poll</button>
			<br><br>
			<div id='poll_cont' style='width:100%;max-height:80vh;overflow-y:auto;'>
				<table id='poll_tbl' style='width:100%;border-collapse:collapse;'>
					<tr>
						<td style='width:25%;border:1px solid white;height:7vh;font-family:Josefin;font-weight:500;background:#689ff7;color:white;font-size:22px;'><center>Question</center></td>
						<td style='width:25%;border:1px solid white;height:7vh;font-family:Josefin;font-weight:500;background:#689ff7;color:white;font-size:22px;'><center>Date of Creation</center></td>
						<td style='width:25%;border:1px solid white;height:7vh;font-family:Josefin;font-weight:500;background:#689ff7;color:white;font-size:22px;'><center>Last date to submit</center></td>
						<td style='width:25%;border:1px solid white;height:7vh;font-family:Josefin;font-weight:500;background:#689ff7;color:white;font-size:22px;'><center>Action</center></td>
					</tr>
				</table>
			</div>
		`
		document.getElementById('widg_cont').appendChild(polldiv)
		await db.collection("polls").onSnapshot((snap)=>{
			document.getElementById('poll_tbl').innerHTML=`
				<tr>
					<td style='width:25%;border:1px solid white;height:7vh;font-family:Josefin;font-weight:500;background:#689ff7;color:white;font-size:22px;'><center>Question</center></td>
					<td style='width:25%;border:1px solid white;height:7vh;font-family:Josefin;font-weight:500;background:#689ff7;color:white;font-size:22px;'><center>Date of Creation</center></td>
					<td style='width:25%;border:1px solid white;height:7vh;font-family:Josefin;font-weight:500;background:#689ff7;color:white;font-size:22px;'><center>Last date to submit</center></td>
					<td style='width:25%;border:1px solid white;height:7vh;font-family:Josefin;font-weight:500;background:#689ff7;color:white;font-size:22px;'><center>Action</center></td>
				</tr>				

			`
			var c=0;
			snap.docs.map(async (g)=>{

				let comuid;
				if (await auth.currentUser.email.split('.').length==3){
					await db.collection('residents').doc(await auth.currentUser.email).get().then(async (user_det)=>{
						comuid=await user_det.data().comuid
					})
				}
				else{
					comuid=await auth.currentUser.email.split('@')[0].split('.')[2]
				}
				if (g.data().raised_by.comuid==comuid){
					let pollrow=document.createElement('tr')
					pollrow.setAttribute('class','polls_row')
					c++;
					pollrow.innerHTML=`
							<td style='font-family:Josefin;font-weight:500;font-size:18px;'><center>`+g.data().title+`</center></td>
							<td style='font-family:Josefin;font-weight:500;font-size:18px;'><center>`+g.data().date_of_creation+`</center></td>
							<td style='font-family:Josefin;font-weight:500;font-size:18px;'><center>`+g.data().date_of_expiry+`</center></td>
							<td style='font-family:Josefin;font-weight:500;font-size:18px;'><center><button id='view_poll`+g.id+`' class='view_poll'>View Poll</button><center>
							<center><button id='cast_poll`+g.id+`' class='cast_poll'>Participate in Poll</button></center></td>
						`
						document.getElementById("view_poll")
					document.getElementById('poll_tbl').appendChild(pollrow)
					document.getElementById('view_poll'+g.id).onclick=async function viewpoll(){
						try{
							document.getElementById('polls_cont_div').remove()
							for (let brs of document.getElementsByClassName('pollbr')){
								brs.remove()
							}
						}
						catch(err){

						}
						try{
							document.getElementById('participate_poll').remove()
							for (let gaps of document.getElementsByClassName('poll_gap_br')){
								gaps.remove()
							}
						}
						catch(err){}
						document.getElementById('view_poll'+g.id).innerHTML=`Close Poll`
						document.getElementById('view_poll'+g.id).setAttribute('class','close_poll')
						document.getElementById('view_poll'+g.id).onclick=function(){
							document.getElementById('polls_cont_div').remove()
							for (let breaks of document.getElementsByClassName('pollbr')){
								breaks.remove()
							}
							document.getElementById('view_poll'+g.id).setAttribute('class','view_poll')
							document.getElementById('view_poll'+g.id).innerHTML="View Poll"
							document.getElementById('view_poll'+g.id).onclick=viewpoll

						}
						let viewpolldiv=document.createElement('div')
						viewpolldiv.id='polls_cont_div'
						viewpolldiv.style='margin:auto;width:67vw;background:white;height:40vh;display:flex;justify-content:space-evenly;'
						viewpolldiv.innerHTML=`
							<canvas id='count_vote' style='float:right;'></canvas>
							<div style='width:35%;background:#e1e2e3;border:2px dashed black;border-radius:8px;'>
								<center><h3><u>Poll Details</u></h3></center>
								<h4 style='padding-left:10px;' id='polltitle'>Title:  `+g.data().title+`</h4>
								<h4 style='padding-left:10px;' id='tot_votes'>Total Votes:  `+g.data().total_voters+`</h4>
								<h4 style='padding-left:10px;' id='reqname'>Poll raised by:  `+g.data().raised_by.name+`</h4>
								<h4 style='padding-left:10px;' id='polldate'>Poll created on:  `+g.data().date_of_creation+`</h4>
								<h4 style='padding-left:10px;' id='pollexpiry'>Poll created on:  `+g.data().date_of_expiry+`</h4>

							</div>
							<br><br>

							
						`
						var br=document.createElement('br')
						br.setAttribute('class','pollbr')
						polldiv.appendChild(br)
						polldiv.appendChild(br)
						polldiv.appendChild(viewpolldiv)
						document.getElementById('polls_cont_div').scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'})
						let questions=[],counts=[];

						let firestore_choices=await g.data().choices
						for (let q in firestore_choices){
							questions.push(q.split(' '))
							counts.push(firestore_choices[q])
						}
						
						const graph_holder=document.getElementById('count_vote')
						new Chart(graph_holder,{
							type:'bar',
							data:{
								labels:questions,
								datasets:[{
									label:"No. of Votes",
									data:counts,
									borderWidth:1

								}]
							},
							options:{
								scales:{
									y:{
										beginAtZero:true
									}
								},
								maintainAspectRatio:true,
								responsive:true
							}
						})
					}
					document.getElementById('cast_poll'+g.id).onclick=async function castpoll(){
						try{
							document.getElementById('participate_poll').remove()
							for (let gaps of document.getElementsByClassName('poll_gap_br')){
								gaps.remove()
							}
						}
						catch(err){}
						try{
							document.getElementById('polls_cont_div').remove()
							for (let brs of document.getElementsByClassName('pollbr')){
								brs.remove()
							}
						}
						catch(err){

						}
						//Checking if user has already taken the poll
						let user_polled
						await db.collection('residents').doc(await auth.currentUser.email).get().then(async (th)=>{
							user_polled=await th.data().polls
						})
						console.log(g.id,user_polled)
						if (user_polled.includes(g.id)==false){
							let participate_poll=document.createElement('div')
							participate_poll.id='participate_poll'
							participate_poll.style='border:2px dashed black;border-radius:5px;'
							participate_poll.innerHTML=`
								<center><h2><u>Voice your Opinion</u></h2></center>
								<br>
								<h3 style='margin-left:20px;'>`+g.data().title+`</h3>

							`
							polldiv.appendChild(participate_poll)
							let chosevotes={}
							for (let pollbtns in g.data().choices){
								let rbtnlbl=document.createElement('label')
								rbtnlbl.style='margin-left:20px;'
								rbtnlbl.id=g.id+'_'+pollbtns+"lbls"
								let rbtn=document.createElement('input')
								rbtn.type='checkbox'
								rbtn.id=g.id+'_'+pollbtns
								rbtnlbl.appendChild(rbtn)
								rbtnlbl.innerHTML+='   '+pollbtns
								chosevotes[g.id+'_'+pollbtns]=[false,pollbtns]
								participate_poll.appendChild(rbtnlbl)
								participate_poll.appendChild(document.createElement('br'))
								participate_poll.appendChild(document.createElement('br'))
								//Selecting one checkbox at a time
								document.getElementById(g.id+'_'+pollbtns).onchange=function(e){
									if (e.currentTarget.checked){
										for (let btns in chosevotes){
											if (btns!=g.id+'_'+pollbtns){
												document.getElementById(btns).checked=false
												chosevotes[btns][0]=false
											}

										}
										chosevotes[g.id+'_'+pollbtns][0]=true
									}
									else{
										chosevotes[g.id+'_'+pollbtns][0]=false
									}

								}

							}

							var submitpoll=document.createElement('center')
							submitpoll.innerHTML=`<button class='submitpoll' id='submitpoll'><span class='fa fa-solid fa-upload'></span>  Submit Poll</button>`
							participate_poll.appendChild(submitpoll)
							participate_poll.appendChild(document.createElement('br'))
							participate_poll.appendChild(document.createElement('br'))
							document.getElementById('submitpoll').onclick=async function(){
								let user_polled_2;
								await db.collection("residents").doc(await auth.currentUser.email).get().then(async (nc)=>{
									user_polled_2=await nc.data().polls
								})
								if (user_polled_2.includes(g.id)==false){
									let total=g.data().total_voters+1
									let novotes=await g.data().choices
									for (let inhtmls in chosevotes){
										if (chosevotes[inhtmls][0]==true){
											novotes[chosevotes[inhtmls][1]]+=1
										}
									}
									await db.collection('polls').doc(g.id).update({
										total_voters:total,
										choices:novotes
									})
									await db.collection('residents').doc(await auth.currentUser.email).get().then(async(t)=>{
										let polls=await t.data().polls 
										polls.push(g.id)
										await db.collection('residents').doc(await auth.currentUser.email).update({polls:polls})
									})
								}
								else{
									alert("You have already taken the poll")

								}

							}
							let gapbr=document.createElement('br')
							gapbr.setAttribute('class','poll_gap_br')
							polldiv.appendChild(gapbr)
							polldiv.appendChild(gapbr)
							polldiv.appendChild(participate_poll)
							participate_poll.scrollIntoView({behavior:'smooth',block:'center',inline:'center'})
							await db.collection('residents').doc(await auth.currentUser.email).get().then(async (m)=>{
								console.log(await m.data().polls)
							})
						}
						else{
							alert("You have already taken the poll")

						}
					} 
				}

			})

		})
		document.getElementById('poll_cr').onclick=async function(){
			let options={};
			let pollcrdiv=document.createElement('div')
			pollcrdiv.id='poll_create'
			pollcrdiv.style='margin:auto;width:90%;background:whitesmoke;border-radius:5px;border:2px dashed black;'
			pollcrdiv.innerHTML=`
				<button class='close' id='close_poll_cr'><span class='fa fa-solid fa-xmark'></span></button>
				
				<br>
				<center><h2>Create a Poll</h2></center>
				<br>
				<div class='inputbox' style='left:5%;'>
					<input required id='title'>
					<label>Poll Question</label>
				</div>
				<br><br>
				<div class='inputbox' style='left:5%;'>
					<input required id='date_of_expiry' onfocus='(this.type="date")' onfocusout='(this.type="text")'>
					<label>Date of Expiry</label>
				</div>
				<br><br>
				<div id='added' style='position:relative;margin-left:5%;'></div>
				<br><br>
				<button id='add_opt'><span class='fa fa-solid fa-plus'></span>  Add Option</button>
				<br><br>
				<div id='ques'></div>
				<br><br>
				<center><button id='publish_poll'><span class='fa fa-solid fa-plus'></span> Publish Poll</button></center>
				<br><br>
			`
			document.getElementById('widg_cont').appendChild(pollcrdiv)
			document.getElementById('close_poll_cr').onclick=function(){
				pollcrdiv.remove()
				options={}
			}
			pollcrdiv.scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'})
			document.getElementById('widg_cont').appendChild(document.createElement('br'))
			document.getElementById('add_opt').onclick=function(){
				let option=document.createElement('div')
				option.id='optiondiv'
				option.style='width:50%;display:flex;justify-content:space-evenly;'
				option.innerHTML=`
					<div class='inputbox'>
						<input required id='option'>
						<label id='optlbl'>Option `+((Object.keys(options).length)+1)+`</label>
					</div>
					<button id='add_option' class='add_opt'><span class='fa fa-solid fa-add'></span></button>

				`
				document.getElementById('ques').appendChild(option)
				document.getElementById('add_option').onclick=function(){
					if (Object.keys(options).length<7){
						let option_val=document.getElementById('option').value.trim()
						let option_txt=document.createElement('h2')
						option_txt.innerHTML=(Object.keys(options).length+1).toString()+'.)'+' '+option_val
						document.getElementById('added').appendChild(option_txt)
						document.getElementById('option').value='';
						options[option_val]=0
						document.getElementById('optlbl').innerHTML=`Option `+(Object.keys(options).length+1).toString()
					}
					else{
						alert("You have reached the maximum number of options")
						document.getElementById('optiondiv').remove()

					}
				}
			}
			document.getElementById('publish_poll').onclick=async function(){
				let polldets=['title','date_of_expiry']
				let checkc=0;
				for (let pollents of polldets){
					if (document.getElementById(pollents).value.trim().length==0){
						alert("All fields are mandatory")
						document.getElementById(pollents).style.border='1px solid red'
					}
					else{
						document.getElementById(pollents).style.border='1px solid black'
						checkc++;


					}
				}
				if (checkc==polldets.length){
					if (!(Object.keys(options).length>=2)){
						alert("Please add enough options to create a Poll")
					}
					else{
						//Acquiring user details
						let userdetails={comuid:'',floor:'',block:'',d_no:'',name:''}
						await db.collection('residents').doc(await auth.currentUser.email).get().then(async (userdet)=>{
							userdetails.comuid=userdet.data().comuid
							userdetails.floor=userdet.data().floor
							userdetails.block=userdet.data().block
							userdetails.d_no=userdet.data().d_no
							userdetails.name=userdet.data().name

						})
						let title=document.getElementById('title').value.trim()
						let doe=document.getElementById('date_of_expiry').value.trim()
						let date_obj=new Date()
						let date=date_obj.getFullYear().toString()+'-'+((parseInt(date_obj.getMonth())+1).toString()).padStart(2,'0')+'-'+(date_obj.getDate().toString()).padStart(2,'0')
						document.getElementById('publish_poll').innerHTML=`<span class='fa fa-solid fa-hourglass' style='animation-name:rotate_360;animation-duration:1s;animation-fill-mode:forwards;animation-iteration-count:infinite;'></span>`
						await db.collection('polls').doc().set({
							date_of_creation:date,
							date_of_expiry:document.getElementById('date_of_expiry').value.trim(),
							choices:options,
							title:document.getElementById('title').value.trim(),
							raised_by:userdetails,
							total_voters:0


						}).then(()=>{
							alert("Poll Created Successfully")
							document.getElementById('publish_poll').innerHTML=`<span class='fa fa-solid fa-plus'></span> Publish Poll`
						
						})
					}
				}
				

			}
		}

	}






})();