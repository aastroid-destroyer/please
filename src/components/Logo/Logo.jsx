import React from 'react'
import logo from '../../assets/logo.png'
import { Link } from 'react-router'

const Logo = () => {
    return (
        <Link to={'/'} className= 'flex items-center gap-1'>
            <img src={logo} alt="" />
            <h1 className='text-3xl font-extrabold -ms-2'>TFSDeliver</h1>
        </Link>
    )
}

export default Logo