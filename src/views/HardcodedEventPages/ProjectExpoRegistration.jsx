import { useState,useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { Fade } from "react-awesome-reveal";
import axios from "../../scripts/axiosConfig";
import { useAuth } from "../../contexts/AuthContext";
import CLink from "../../components/CLink";
import { FiChevronLeft } from "react-icons/fi";
import { IoShieldCheckmark, IoClose } from "react-icons/io5";
import "../../styles/ProjectExpoRegistration.scss";


// import Accomidation from "./Accomidation";

export default function ProjectExpoRegistration() {
  const { currentUser, USER_PRESENT, signinwithpopup } = useAuth();
  const location = useLocation();

  const [txnID, setTxnID] = useState( localStorage.getItem("txnID") || null );
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [confirmModalShown, setConfirmModalShown] = useState(false);
  const [teamMembers, setTeamMembers] = useState({});
  const [numberOfMembers, setNumberOfMembers] = useState(4);
  const [registrationStatus, setRegistrationStatus] = useState("not_registered");
  const [paymentStatus, setPaymentStatus] = useState( localStorage.getItem("paymentStatus") || "unpaid" );
  const [paymentconfirmation, setPaymentConfirmation] = useState(false)
  const [paymentLoadingText, setPaymentLoadingText] = useState("");

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [registrationLoading, setRegistrationLoading] = useState(false);

  const [registrationDisabled, setRegistrationDisabled] = useState(false);
  const [accomodationDetails, setAccomodationDetails] = useState({});
  const [needAccomodation, setNeedAccomomdation] = useState(false);

  const form = useRef(null);


  const formatDate = (date) => {
    console.log(typeof date);
    return date;
  }

  const validateFunction = () => {
    if (paymentconfirmation) {
      console.log("Payment successfull");
      setPaymentLoading(false);
    } else {
      toast.error("Payment declined");
      setPaymentLoading(false);
    }
  }

  const startPayment = async (e) => {
    setPaymentLoading(true);

    if (!form.current.checkValidity()) {
      toast.info("Please fill all the fields to continue.");
      setPaymentLoading(false);
      return;
    }

    e.preventDefault();
    setPaymentLoading(true);
    const response = await axios.post('https://gfg-server.onrender.com/createOrder');
    const order = response.data;

    console.log("Initiating payment.");

    const options = {
      key: 'rzp_live_QdGShimqqkNStv',
      amount: order.amount,
      currency: 'INR',
      name: 'GFG KARE Prajnotsavah',
      description: 'Registration Fee for GFG KARE Prajnotsavah',
      order_id: order.id,
      handler: async function (response) {
        const teamSize = form.current.elements.numberOfMembers.value;
        const team = {};
        setPaymentConfirmation(true)
        for (let i = 1; i <= teamSize; i++) {
          team[`member${i}`] = {
            name: form.current.elements[`memberName${i}`].value,
            email: form.current.elements[`memberEmail${i}`].value,
            registerNo: form.current.elements[`memberRegisterNo${i}`].value,
            number: form.current.elements[`memberNumber${i}`].value,
            institution: form.current.elements[`memberInstitution${i}`].value,
            location: form.current.elements[`memberLocation${i}`].value,
          };
        }
        setTeamMembers(team);

        try {
          setPaymentLoadingText("Verifying payment...");
          const paymentInfo = {
            payment_id: response.razorpay_payment_id,
            order_id: response.razorpay_order_id,
            email: currentUser.email,
            name: currentUser.displayName,
            teamName: form.current.elements.teamName.value,
            theme: form.current.elements.theme.value,
            teamMembers: team,
            accomodationDetails: accomodationDetails
          };
          await axios.post('https://gfg-server.onrender.com/verifyPayment', paymentInfo);
          setTxnID(response.razorpay_payment_id);
          setPaymentStatus("paid");
          if (form.current.checkValidity()) {
            setPaymentLoadingText(null);
            toast.success("Payment is successful. Please proceed with the registration process.");
            localStorage.setItem("paymentStatus", "paid");
            localStorage.setItem("txnID", response.razorpay_payment_id);
            setConfirmModalShown(true);
            setPaymentLoading(false);
          }
          else {
            setPaymentLoadingText(null);
            toast.info("Some fields are not filled. Kindly fill all the fields to register.");
            setPaymentLoading(false);
          }
        } catch (error) {
          setPaymentLoadingText(null);
          setPaymentLoading(false);
          console.error("Payment verification failed", error);
          toast.error("Payment verification failed. Please try again later.");
        }
      },
      prefill: {
        name: currentUser.displayName,
        email: currentUser.email,
        contact: form.current.elements["memberNumber1"].value
      },
      notes: {
        address: 'GFG-KARE'
      },
      theme: {
        color: '#2e8d46'
      }
    };

    const rzp1 = new window.Razorpay(options);
    rzp1.open();
    validateFunction()
  };

  const register = async (e) => {
    setRegistrationLoading(true);
    e.preventDefault();
    if (!USER_PRESENT()) {
      toast.error("You have to be logged in to complete registration.");
      setRegistrationLoading(false);
      return;
    }

    const teamName = form.current.elements.teamName.value;
    const theme = form.current.elements.theme.value;
    const teamSize = form.current.elements.numberOfMembers.value;
    const team = {};
    for (let i = 1; i <= teamSize; i++) {
      team[`member${i}`] = {
        name: form.current.elements[`memberName${i}`].value,
        email: form.current.elements[`memberEmail${i}`].value,
        registerNo: form.current.elements[`memberRegisterNo${i}`].value,
        number: form.current.elements[`memberNumber${i}`].value,
        institution: form.current.elements[`memberInstitution${i}`].value,
        location: form.current.elements[`memberLocation${i}`].value,
      };
    }
    setTeamMembers(team)
    let accomodationDetails = {};

    if (form.current.elements["needAccomodation"].checked) {
      const noOfDays = form.current.elements["noOfDays"].value;
      const noOfMembers = form.current.elements["noOfMembers"].value;
      const checkInDate = form.current.elements["checkInDate"].value;
      const checkInTime = form.current.elements["checkInTime"].value;
      const checkOutDate = form.current.elements["checkOutDate"].value;
      const checkOutTime = form.current.elements["checkOutTime"].value;
      accomodationDetails = {
        noOfDays,
        noOfMembers,
        checkInDate,
        checkInTime,
        checkOutDate,
        checkOutTime
      };
    }

    console.log("=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=")
    console.log({
      teamName,
      theme,
      teamSize,
      teamMembers: team,
      txnID,
      needAccomodation: form.current.elements["needAccomodation"].checked,
      accomodationDetails: accomodationDetails
    });
    console.log("=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=")

    await axios.post('/register_projectexpo', {
      teamName,
      theme,
      teamSize,
      teamMembers: team,
      txnID,
      needAccomodation: form.current.elements["needAccomodation"].checked,
      accomodationDetails: accomodationDetails
    }, 
    { headers: { Authorization: await currentUser.getIdToken() } })
    .then((response) => {
      localStorage.clear();
      setRegistrationLoading(false);
      console.log(response.data);
      toast.success(response.data.message || "Registration successful!");
      setRegistrationStatus("registered");
      setConfirmModalShown(false);
    })
    .catch((error) => {
      setRegistrationLoading(false);
      toast.error(error.response.data.message ||  "Registration failed. Please try again later.");
      setConfirmModalShown(false);
    })
  };

  useEffect(() => {
    if (confirmModalShown) {
      document.body.style.overflowY = "hidden";
    } else {
      document.body.style.overflowY = "auto";
    }
  }, [confirmModalShown]);

  return (
    <>
      {confirmModalShown && (
        <div className="confirmModalBackground">
          <div className="confirmModal">
            <button className="close" onClick={() => setConfirmModalShown(false)}><IoClose size={"30px"} /></button>
            <div className="heading">Confirm Details</div>
            <div className="field">
              <div className="title color green">Team Name</div>
              <div className="value">{form.current?.elements.teamName?.value}</div>
            </div>
            <div className="field">
              <div className="title color green">Theme</div>
              <div className="value">{form.current?.elements.theme?.value}</div>
            </div>
            <div className="field">
              <div className="title color green">Number of members</div>
              <div className="value">{form.current?.elements.numberOfMembers?.value}</div>
            </div>
            <div className="title color green">Team Members</div>
            {Object.keys(teamMembers).map((memberKey, index) => (
              <div className="field" key={index}>
                <div className="title">{teamMembers[memberKey].name}</div>
                <div className="value">{teamMembers[memberKey].email}</div>
              </div>
            ))}
            <div className="accomodationDetailsConfirm">
              <div className="field">
                <div className="title color green">Need Accomodation</div>
                <div className="value">{form.current?.elements["needAccomodation"].checked ? "Yes" : "No"}</div>
              </div>
              {
                form.current?.elements["needAccomodation"].checked && (
                  <div className="field">
                    <div className="value">
                      Accomodation needed for {form.current?.elements["noOfMembers"].value} members for {form.current?.elements["noOfDays"].value} days from {formatDate(form.current?.elements["checkInDate"].value)} {form.current?.elements["checkInTime"].value} to {form.current?.elements["checkOutDate"].value} {form.current?.elements["checkOutTime"].value}.
                    </div>
                  </div>
                )
              }
            </div>
            <div className="field">
              <div className="title">TXN ID</div>
              <div className="value">{txnID}</div>
            </div>
            <div className="title ss">Kindly take a screenshot of this page and keep it safe for confirmation.</div>
            <input type="checkbox" id="detailsCorrectCheckbox" onClick={(e) => setConfirmChecked(e.target.checked)} />
            <label htmlFor="detailsCorrectCheckbox">
              The details are correct and I wish to go for the registration. I understand that modification of these details are not possible.
            </label>
            {confirmChecked && <Fade className="finalRegisterButton"><button onClick={register}>Register!</button></Fade>}
          </div>
        </div>
      )}

      <nav className="projectExpoNav">
          <div className="back">
              <CLink to={location?.state?.from || "/events/project-expo"}>
                  <FiChevronLeft size={"25px"} />
              </CLink>
          </div>

          <div className="bigText projectExpoText">
              PRAJNOTSavaH
          </div>

          <div className="profile">
              {
                  (USER_PRESENT()) ? (
                      <CLink to={"/profile"}>
                          <img src={currentUser.photoURL} alt="" />
                      </CLink>
                  ) : (
                      <div onClick={() => signinwithpopup("google")}>Sign In</div>
                  )
              }
          </div>
      </nav>


      <div className="projectExpoRegistration">
        <div className="titleText">Registration</div>
        <form className="registrationForm" ref={form} onSubmit={(e) => e.preventDefault()}>
          <div className="formGroup">
            <label htmlFor="teamName">Team Name:</label>
            <input required type="text" id="teamName" name="teamName" />
          </div>
          <div className="formGroup">
            <label htmlFor="theme">Theme:</label>
            <select defaultValue={"Healthcare"} id="theme" name="theme">
              <option value="Healthcare">Healthcare</option>
              <option value="FinTech">FinTech</option>
              <option value="AgroTech">AgroTech</option>
              <option value="Fitness and Sports">Fitness and Sports</option>
              <option value="BlockChain">BlockChain</option>
            </select>
          </div>
          <div className="formGroup">
            <label htmlFor="numberOfMembers">Number of Members:</label>
            <select 
              id="numberOfMembers" 
              name="numberOfMembers" 
              defaultValue={4} 
              onChange={(e) => setNumberOfMembers(e.target.value)}
              required
            >
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </div>
          {[...Array(Number(numberOfMembers))].map((_, index) => (
            <div className={`formGroup memberDetails ${index === 0 && "zero"}`} key={index}>
              <label htmlFor={`memberName${index + 1}`}>Member {index + 1} Name:</label>
              <input required type="text" id={`memberName${index + 1}`} name={`memberName${index + 1}`} defaultValue={index === 0 ? currentUser?.displayName : ''} />
              <label htmlFor={`memberEmail${index + 1}`}>Member {index + 1} Email:</label>
              <input required type="email" id={`memberEmail${index + 1}`} name={`memberEmail${index + 1}`} defaultValue={index === 0 ? currentUser?.email : ''} />
              <label htmlFor={`memberRegisterNo${index + 1}`}>Member {index + 1} College Register No:</label>
              <input required type="text" id={`memberRegisterNo${index + 1}`} name={`memberRegisterNo${index + 1}`} onChange={(e) => {
                if (e.target.value.startsWith("99") || e.target.value.startsWith("98") ) {
                  setRegistrationDisabled(true);
                  toast.error("KARE Students are not allowed to register at this time. Contact us for more information.", { toastId: "reg_no_error" });
                }
                else {
                  setRegistrationDisabled(false);
                }
              }} />
              <label htmlFor={`memberPhone${index + 1}`}>Member {index + 1} Whatsapp Number:</label>
              <input required type="number" id={`memberNumber${index + 1}`} name={`memberNumber${index + 1}`} />
              <label htmlFor={`memberCollege${index + 1}`}>Member {index + 1} College:</label>
              <input required type="text" id={`memberInstitution${index + 1}`} name={`memberInstitution${index + 1}`} />
              <label htmlFor={`memberLocation${index + 1}`}>Member {index + 1} Location:</label>
              <input required type="location" id={`memberLocation${index + 1}`} name={`memberLocation${index + 1}`} />
            </div>
          ))}

          <div className="accomodationDetails">

            <div className="accomodationCheckBoxContainer">

              <input 
                type="checkbox" 
                name="needAccomodation" 
                onChange={(e) => setNeedAccomomdation(e.target.checked)} 
                disabled={registrationDisabled}
              />
              <label htmlFor="needAccomodationCheckbox">
                Need accomodation for the event?
              </label>
            </div>

            {
              (needAccomodation) && (
                <>
                  <div className='inputs'>
                    <div className="textInputs">
                      <div className="inputGroup">
                          <label className="label">How many days</label>
                          <input
                              required
                              type="number"
                              max={2}
                              name="noOfDays"
                              autoComplete="off"
                              className="input"
                          />
                      </div>
                      <div className="inputGroup">
                        <label className="label">How many members</label>
                          <input
                              required
                              type="number"
                              max={4}
                              name="noOfMembers"
                              autoComplete="off"
                              className="input"
                          />
                      </div>
                    </div>
                  </div>
                  <h4>Checkin date and time :</h4>
                  <div className='dateAndTimeInput'>
                      
                  <div className="input-group">
                      <input
                          required
                          type="date"
                          name="checkInDate"
                          autoComplete="off"
                          className="input"
                      />
                  </div>
                  <div className="input-group">
                      <input
                          required
                          type="time"
                          name="checkInTime"
                          autoComplete="off"
                          className="input1"
                      />
                  </div>
                  </div>
                  <h4>Checkout date and time :</h4>
                  <div className='dateAndTimeInput'>
                      
                  <div className="input-group">
                      <input 
                          type="date"
                          name="checkOutDate"
                          autoComplete="off"
                          className="input"
                      />
                  </div>
                  <div className="input-group">
                      <input
                          required
                          type="time"
                          name="checkOutTime"
                          autoComplete="off"
                          className="input1"
                      />
                  </div>
                  </div>
                </>
              )
            }
          </div>
            
          {/* <Accomidation setAccomodationDetails={setAccomodationDetails} /> */}
          {USER_PRESENT() && (
            <>
              {registrationStatus === "registered" ? (
                <>
                  <div className="registrationInfo">
                    <span className="team">You have registered under the team: {form.current.elements.teamName.value}.</span>
                    <div className="paymentSuccessInfo">
                      <div className="text">
                        <div className="title">Payment Status</div>
                        <div><span className="color green">Paid</span> (ID: {txnID})</div>
                      </div>
                      <div className="icon"><IoShieldCheckmark size={"40px"} /></div>
                    </div>

                    <button disabled>Registered!</button>
                  </div>
                </>
              ) : (
                paymentStatus === "paid" && (
                  <>
                    <div className="paymentSuccessInfo">
                      <div className="text">
                        <div className="title">Payment Status</div>
                        <div><span className="color green">Paid</span> (ID: {txnID})</div>
                      </div>
                      <div className="icon"><IoShieldCheckmark size={"40px"} /></div>
                    </div>
                    
                    <div className="payment">
                      <button 
                        type="button"
                        disabled={registrationDisabled || paymentLoading || registrationLoading} 
                        onClick={() => {
                        if (form.current.checkValidity()) {
                          console.log("All fields valid. Showing preview modal.");
                          setConfirmModalShown(true);
                        }
                        else {
                          const formElements = form.current.elements;
                          for (let i = 0; i < formElements.length; i++) {
                            const element = formElements[i];
                            let erroredFields = [];
                            if (element.required && !element.reportValidity()) {
                              console.log(`Field ${element.name} is invalid.`);
                              erroredFields.push(element.name);
                            }
                          }
                          if (erroredFields.length) {
                            toast.error(`Please fill in or correct the following fields: ${erroredFields.join(", ")}`);
                          }
                        }
                      }}>Register</button>
                    </div>
                  </>
                )
              )}
            </>
          )}
        </form>
        {USER_PRESENT() && paymentStatus === "unpaid" && (
          <div className="payFeeDiv">
            <div className="title">Payment</div>
            <div className="feeBreakdown">
              <div className="row">
                <div className="name">Registration Fee</div>
                <div className="amount">₹500</div>
              </div>
              <div className="row">
                <div className="name">Convinience Fee</div>
                <div className="amount faded">₹17</div>
              </div>
              <div className="row bold">
                <div className="name color green">Total</div>
                <div className="amount color green">₹517</div>
              </div>

            </div>
              

              {
                (!paymentLoading) ? (
                  <button disabled={registrationDisabled || paymentLoading || registrationLoading} onClick={startPayment}>
                    Proceed with payment
                  </button>
                ) : (
                  <button disabled>Starting payment...</button>
                )
              }
          </div>
          
        )}
        {!USER_PRESENT() && (
          <button disabled={registrationDisabled || paymentLoading || registrationLoading} onClick={() => signinwithpopup("google")}>Sign in to Register!</button>
        )}
      </div>
    </>
  );
}