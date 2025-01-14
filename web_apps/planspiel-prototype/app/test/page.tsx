
import React from 'react'
import { Buergerrat, Fact, GameState, Post, PostType, RoleData, RoleMetadata, UserView } from '../api/models'
import PersonProfile from '../play/ProfileComponents/PersonProfile'
import { MdOutlineMail } from 'react-icons/md'
import { GoCommentDiscussion } from 'react-icons/go'
import { BsPersonVcard } from 'react-icons/bs'
import path from 'path'
import fs from 'fs'

const page = () => {

    const user : UserView = {
        administrator: false,
        assignedBuergerrat: 1,
        assignedRoleId: "11_anais_fournier",
        status: "online",
        username: "schnelles-Pferd"
    }

    const buergerratOne : Buergerrat = {
        parameters: ["Parameter of Wisdom", "Parameter of Courage"],
        configuration: null
    }

    const buergerratTwo : Buergerrat = {
        parameters: ["Parameter of Doom", "Parameter of Power"],
        configuration: null
    }

    const gameState : GameState = {
        phase: "voting",
        votingEnd: new Date("01-12-2025 14:08"),
        buergerrat1: buergerratOne,
        buergerrat2: buergerratTwo,
        id: 0,
        projection: null
    }

    const roleID : string = "7_yasemin_aidin";

    const testRole : RoleData | null = GetRoleData(roleID);
    
    if (!testRole) return <div>Error When trying to read role. Check the Npm console.</div>
    
    const testFacts = GatherFacts(roleID);
    testRole.facts = testFacts;
    const testPosts = GatherPosts(roleID);
    testRole.posts = testPosts;

  return (
    <div className="bg-cover bg-center bg-no-repeat bg-sky-900 min-h-screen bg-fixed">
            <PersonProfile roleID={user.assignedRoleId? user.assignedRoleId:""} gameState={gameState} roleData={testRole}/> : 
            

            <div className="fixed w-full h-[10%] left-0 bottom-0 bg-sky-600 shadow-[0px_0px_20px_rgba(0,0,0,0.5)] flex">
                <div className="w-1/3 content-center">
                    <BsPersonVcard color={"white"} className="m-auto w-[60%] h-[60%] transition-all transition-duration-200"/>
                </div>
                <div className="w-1/3 content-center">
                    <GoCommentDiscussion color={"black"} className="m-auto w-[60%] h-[60%] transition-all transition-duration-200"/>
                </div>
                <div className="w-1/3 content-center">
                    <MdOutlineMail color={"black"} className="m-auto w-[60%] h-[60%] transition-all transition-duration-200"/>
                </div>
            </div>
        </div>
  )
}

interface FactJSON {
    hyperlink: string,
    isScenario: boolean,
    conditions: string[]
}

interface PostJSON {
    type: PostType,
    isScenario: boolean,
    author: string,
    conditions: string[]
}

function GatherPosts(roleID: string): Post[] {
    
    const postsDir = path.join(process.cwd(), 'public', 'roles', roleID, 'posts');
    const posts : Post[] = [];

    if (!fs.existsSync(postsDir)) {
        console.error(`Facts directory ${postsDir} not found.`);
        return posts;
    }

    // Iterate through each subfolder in the "facts" directory
    const factFolders = fs.readdirSync(postsDir).filter((folder) =>
        fs.statSync(path.join(postsDir, folder)).isDirectory()
    );

    factFolders.forEach((folder) => {
        const folderPath = path.join(postsDir, folder);
        const post: Post = {
            isScenario: false,
            name: folder,
            textDeIdentifier: 'roles/'+ roleID+ '/posts/'+ folder + "/text_de.md",
            textOrigIdentifier: 'roles/'+ roleID+ '/posts/'+ folder + "/text_orig.md",
            author: "",
            imageIdentifiers: [],
            type: 'i_liked'
        }
        

        // Check for specific files in the folder
        const files = fs.readdirSync(folderPath);
        files.forEach((file) => {
            const filePath = path.join(folderPath, file);
            if (file.endsWith('.json')) {
                // Merge JSON content into the `data` field
                const content : PostJSON = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                post.author = content.author;
                post.isScenario = content.isScenario;
                post.type = content.type;
            } if (file.endsWith(".png")) {
                post.imageIdentifiers.push('roles/'+ roleID+ '/posts/'+ folder + "/" + file);
            }
        });

        posts.push(post);
    });

    return posts;
}

function GatherFacts(roleID: string): Fact[] {
    
    const factsDir = path.join(process.cwd(), 'public', 'roles', roleID, 'facts');
    const facts : Fact[] = [];

    if (!fs.existsSync(factsDir)) {
        console.error(`Facts directory ${factsDir} not found.`);
        return facts;
    }

    // Iterate through each subfolder in the "facts" directory
    const factFolders = fs.readdirSync(factsDir).filter((folder) =>
        fs.statSync(path.join(factsDir, folder)).isDirectory()
    );

    factFolders.forEach((folder) => {
        const fact: Fact = {
            hyperlink: "https://youtube.com",
            isScenario: false,
            name: folder,
            textIdentifier: "text.md"
        }
        const folderPath = path.join(factsDir, folder);

        // Check for specific files in the folder
        const files = fs.readdirSync(folderPath);
        files.forEach((file) => {
            const filePath = path.join(folderPath, file);
            if (file.endsWith('.json')) {
                // Merge JSON content into the `data` field
                const content : FactJSON = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                fact.hyperlink = content.hyperlink;   
            }
        });

        facts.push(fact);
    });

    return facts;
}

function GetRoleData(roleID: string) : RoleData | null{
    const rolesDir = path.join(process.cwd(), 'public', 'roles', roleID); // Path to the roles directory

  if (!fs.existsSync(rolesDir)) {
    console.error('Roles directory not found.');
    return null;
  }

  let roleData : RoleData | null = {
    facts: [],
    infoIdentifier: `roles/${roleID}/info.md`,
    metadata: {
        birthday: "",
        gender: "w",
        job: "__ Homeless",
        language: "__ Deutsch",
        living: "__ At Home",
        name: "__ Bilbo Baggins",
        status: "__ Let's go on an adventure!"
    },
    posts: [],
    profilePictureIdentifier: `roles/${roleID}/profile_picture.png`,
    profilePictureOldIdentifier: `roles/${roleID}/profile_picture_old.png`,
    titlecardIdentifier: `roles/${roleID}/titlecard.png`,
  }

  const files = fs.readdirSync(rolesDir); // Get all files in the roles folder
  const roles = files
    .filter((file) => file.endsWith('.json')) // Only process JSON files
    .map((file) => {
        const filePath = path.join(rolesDir, file);
        if (file.endsWith('metadata.json')) {
            roleData.metadata = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        } if (file.endsWith('picture.png')) {

        }
      
      const content = JSON.parse(fs.readFileSync(filePath, 'utf-8')); // Read and parse JSON file
      const roleName = path.basename(file, '.json'); // Extract file name without extension
      return {
        roleName,
        ...content,
      };
    });

  return roleData;
}

export default page
