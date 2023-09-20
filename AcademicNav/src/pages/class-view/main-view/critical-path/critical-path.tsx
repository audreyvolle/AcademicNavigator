import 'reactflow/dist/style.css';
import './critical-path.scss';
import { useUser } from '../../../../Providers/UserProv';
import computerScienceBA from '/public/images/critical-path-images/computer-science-ba.svg';
import computerScienceBS from '/public/images/critical-path-images/computer-science-bs.svg';
import publicHealth from '/public/images/critical-path-images/public-health.svg';
import test from '/public/images/critical-path-images/test.svg';

// Add more SVG files as needed
const svgFiles = {
  'computer-science-ba': computerScienceBA,
  'computer-science-bs': computerScienceBS,
  'public-health': publicHealth,
  'test': test
};

const fullMajorNames = {
  'computer-science-ba': "Computer Science BA",
  'computer-science-bs': "Computer Science BS",
  'public-health': "Public Health",
  'test': "Test"
};

const CriticalPath = () => {
  const { selectedValue } = useUser();
  console.log(selectedValue);
  const selectedSVG = svgFiles[selectedValue as keyof typeof svgFiles];
  const major = fullMajorNames[selectedValue as keyof typeof fullMajorNames];

  return (
    <div className='critical-path-container'>
      <h1 className='critical-path-heading'>{major} Critical Path</h1>
      {selectedSVG && (
        <img className='critical-path-img' src={selectedSVG} alt={`SVG for ${selectedValue}`} />
      )}
    </div>
  );
};

export default CriticalPath;
