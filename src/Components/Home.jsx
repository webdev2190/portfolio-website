import React from 'react'
import HeroImage from '../assets/heroImage.png';
import { MdOutlineKeyboardArrowRight} from 'react-icons/md';
import {Link} from 'react-scroll';

const Home = () => {
  return (
    <div 
    name="home"
    className="h-screen w-full bg-gradient-to-b  from-black via-black to-gray-800 text-white">

        <div className="max-w-screen-lg mx-auto flex flex-col 
        items-center justify-center h-full px-4 md:flex-row">

          <div className="flex flex-col justify-center h-full">
            <h2 className="text-4xl sm:text-7xl font-bold text-white">
              I'm a full Stack Developer 
            </h2>
            <p className="text-gray-500 py-4 max-w-md">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos porro blanditiis, 
              earum corrupti dolore suscipit perferendis inventore sapiente temporibus? 
              Maiores ratione magni repellat nisi cupiditate ut tempora sequi quasi ad!
            </p>
            <div>
              <Link 
              to="portfolio" smooth duration={500}
              className="group text-whit w-fit px-6 py-3 my-2 flex items-center
              rounded-md bg-gradient-to-r from-sky-400 to-indigo-500 cursor-pointer">  
              Portfolio
                  <span className="group-hover:rotate-90 duration-300">
                  <MdOutlineKeyboardArrowRight size={25} className="ml-1"/> 
                </span>
              </Link>  
            </div>
          </div>

          <div>
            <img src={HeroImage} 
            alt="my profile" className='max-w-xl h-auto rounded-lg shadow-xl 
            w-2/3 dark:shadow-gray-800'/>
          </div>
        </div>
    </div>
  )
}

export default Home; 
