import Welcome from './welcome/welcome';
import { useUser } from '../Providers/UserProv';
import MainView from './class-view/main-view/main-view';
const Home = () => {
    const {isMainViewVisible } = useUser();

    return (
        <>
            {!isMainViewVisible?<Welcome/>:<MainView />}
        </>
    );
};


export default Home;