import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyChats, dummyUserData } from "../assets/assets";
import axios from 'axios'
import toast from "react-hot-toast";

axios.defaults.baseURL=import.meta.env.VITE_SERVER_URL;

const AppContext=createContext()

export const AppContextProvider=({children})=>{
    const navigate=useNavigate()
    const [user,setUser]=useState(null)
    const [chats,setChats]=useState([])
    const [selectedChat,setSelectedChat]=useState(null)
    const [theme,setTheme]=useState(localStorage.getItem('theme')||'light')
    const [token,setToken]=useState(localStorage.getItem('token')|| null)
    const [loadingUser,setLoadingUser]=useState(true);

    useEffect(()=>{
        if(token){
            fetchUser()
        }
        else{
            setUser(null)
            setLoadingUser(false)
        }
    },[token])
    
    const fetchUser=async()=>{
        try {
            const response=await axios.get("/api/user/data",{headers:{Authorization:token}})
            const data=response.data;
            if(data.success){
                setUser(data.user)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)            
        }
        finally{
            setLoadingUser(false)
        }
    }
    
    useEffect(()=>{
        if(user){
            fetchUsersChats()
        }else{
            setChats([])
            setSelectedChat(null)
        }
    },[user])

    
    const fetchUsersChats=async()=>{
        try {
            const response=await axios.get('/api/chat/get',{headers:{Authorization:token}})
            const data=response.data;
            if(data.success){
                setChats(data.chats)
                //If the user has no chats,create one
                if(data.chats.length===0){
                    await createNewChat()
                    return fetchUsersChats()
                }else{
                    setSelectedChat(data.chats[0])
                }
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }
    
    const createNewChat=async()=>{
        try {
            if(!user){
                return toast('Login to create a new chat')
            }
            navigate('/')
            await axios.get('/api/chat/create',{headers:{Authorization:token}})
            await fetchUsersChats()
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(()=>{
        if(theme==='dark'){
            document.documentElement.classList.add('dark')
        }else{
            document.documentElement.classList.remove('dark')
        }
        localStorage.setItem('theme',theme)
    },[theme])


    const value={
        navigate,user,setUser,chats,setChats,selectedChat,setSelectedChat,theme,setTheme,createNewChat,loadingUser,fetchUsersChats,token,setToken,axios,fetchUser
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppContext=()=>useContext(AppContext)