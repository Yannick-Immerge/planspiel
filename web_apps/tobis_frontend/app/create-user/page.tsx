import EarthBackground from '../components/BackgroundWrapper';
import CreateUserChecker from './CreateUserChecker'

interface User {
    id: number;
    username: string;
}

const CreateUser = async () => {
    const res = await fetch('https://jsonplaceholder.typicode.com/users', 
        {/* cache: 'no-store', /* If data changes constantly */ next:{revalidate: 10}})
    const users: User[] = await res.json();

    return (<>
        <div className="bg-cover bg-center bg-no-repeat bg-[url(/images/EarthTint.png)] min-h-screen bg-fixed">
            <div className="w-[66.66%] ml-[16.5%] mr-[16.5%] pt-10 pb-10">
                <CreateUserChecker takenUNames={users.map(n => n.username)} />
            </div>
        </div>
    </>)
}

export default CreateUser
