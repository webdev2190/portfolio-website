import React from "react";

const About = () => {
  return (
    <div 
    name="about" 
    className="w-full h-screen bg-gradient-to-b from-gray-800 
    to-black text-white">

      <div className="max-w-screen-lg p-4 mx-auto flex flex-col 
        justify-center w-full h-full">

        <div className="pb-8">
          <p className="text-4xl font-bold inline border-b-4 border-gray-500">
            About
          </p>
        </div>

      <p className="text-xl mt-20">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Adipisci
        consequuntur incidunt praesentium laudantium sit, dignissimos provident
        rerum. Quidem iure odit, quisquam culpa voluptates accusamus earum
        laboriosam nihil amet voluptate saepe rerum voluptatum magni maiores?
        Optio eveniet, neque perspiciatis exercitationem iste possimus inventore
        maiores delectus ad alias aperiam! Inventore, aspernatur perspiciatis?
      </p>

      {/* <br /> */}

      <p className="text-xl">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur,
        aliquid at similique nesciunt commodi atque asperiores tenetur, soluta
        magni libero molestiae odio perspiciatis deserunt, eaque dicta
        cupiditate inventore ex dolore veritatis aliquam facilis obcaecati
        accusamus dolorem beatae. Dolores laborum ducimus est sunt accusantium
        quos similique necessitatibus beatae quibusdam voluptate? Maiores?
      </p>
      </div>
    </div>
  );
};

export default About;
