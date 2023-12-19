import { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";

import { LuLayoutDashboard } from "react-icons/lu";
import { PiVideoLight } from "react-icons/pi";
import { GoInfo } from "react-icons/go";

import { VscLinkExternal, VscLayers } from "react-icons/vsc";
import { CiCircleList } from "react-icons/ci";
import { LuBrainCircuit } from "react-icons/lu";


import ConfettiExplosion from 'react-confetti-explosion';


import "../styles/Dahsboard.scss";

import { useAuth } from "../contexts/AuthContext"
import gfgLogo from "../assets/GFG_KARE.svg"
import Fade from "../components/Fade";


export default function Dashboard() {

    const { currentUser, USER_PRESENT, USER_LOADING, signinwithpopup } = useAuth();
    const navigate = useNavigate();

    const [circlePerc, setCirclePerc] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [animationDone, setAnimationDone] = useState(false);

    const [isExploding, setIsExploding] = useState(false);
    const [pageToShow, setPageToShow] = useState("loading");

    const visualsRef = useRef(null);

   const celebrate = () => {
        setIsExploding(true);
        setAnimationDone(true);
    }

   
    useEffect(() => {
        if (USER_PRESENT()) setPageToShow("open");
        else if (USER_LOADING()) setPageToShow("loading");
        else if (!USER_PRESENT()) setPageToShow("login");

    }, [currentUser])

    useEffect(() => {
        if (pageToShow === "open") {
            setTimeout(() => {
                setIsVisible(true);
                setCirclePerc(95);
            }, 1000);
        }
    }, [pageToShow])

    return (
            <div className="dashboard">
                {
                    (pageToShow === "open") ? (
                        <Fade>
                            {isExploding ? <ConfettiExplosion zIndex={99} duration={5000} particleCount={50} width={3000} force={1} onComplete={() => setIsExploding(false)} /> : <></>}
                            <div className="leftNav open">
                                <div className="logo">
                                    <img src={gfgLogo} alt="logo" />
                                </div>

                                <div className="icons">
                                    <div className="tab" onClick={() => navigate("/dashboard")}>
                                        <div className="icon"><LuLayoutDashboard size="25px" strokeWidth={1.25} /></div>
                                        <span className="name">Overview</span>
                                    </div>

                                    <div className="tab"  onClick={() => navigate("/dashboard/rounds")}>
                                        <div className="icon"> <VscLayers size="25px" /> </div>
                                        <span className="name">Rounds</span>
                                    </div>

                                    <Link className="tab" target="_blank">
                                        <div className="icon"> <GoInfo  size="25px" /> </div>
                                        <div className="name"> Rule Book <VscLinkExternal /></div>
                                    </Link>

                                    <Link className="tab" target="_blank">
                                        <div className="icon"><PiVideoLight className="icon" size="15px" /></div>
                                        <span className="name">Expert Lecture <VscLinkExternal /></span> 
                                    </Link>

                                    <Link className="tab" to="https://gfgkare.github.io/Algorithmist2024Rounds" target="_blank">
                                        <div className="icon"> <CiCircleList size="25px" /> </div>
                                        <div className="name">List of Rounds <VscLinkExternal /></div>
                                    </Link>

                                    <Link className="tab" to="https://gfgkare.github.io/Algorithmist24" target="_blank">
                                        <div className="icon"> <LuBrainCircuit size="25px" strokeWidth={1} /> </div>
                                        <div className="name">List of Algorithms <VscLinkExternal /></div>
                                    </Link>

                                </div>
                                
                                <div className="profileImage">
                                    <img src={currentUser.photoURL} />
                                </div>
                            </div>
                            
                            <div className="rightDivContainer">
                                <div className="rightDiv">
                                   <Outlet context={[circlePerc, isVisible, visualsRef, celebrate, animationDone, setAnimationDone]} />
                                </div>
                            </div>                            
                        </Fade>
                    ) : (
                        // (USER_LOADING()) ? (
                        (pageToShow === "loading") ? (
                            "loading..."
                        ) : (
                            <div className="notSignedIn">
                                Log in to use the dashboard.
                                <button onClick={() => signinwithpopup("google")}>Sign In</button>
                            </div>
                        )
                        
                    )
                }
            </div>
       
    )
}