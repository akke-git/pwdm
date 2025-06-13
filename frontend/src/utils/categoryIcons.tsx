import React from 'react';
import FolderIcon from '@mui/icons-material/Folder';
import WorkIcon from '@mui/icons-material/Work';
import HomeIcon from '@mui/icons-material/Home';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import TheatersIcon from '@mui/icons-material/Theaters';
import FlightIcon from '@mui/icons-material/Flight';
import SchoolIcon from '@mui/icons-material/School';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import CategoryIcon from '@mui/icons-material/Category';
// 추가 아이콘 가져오기
import ComputerIcon from '@mui/icons-material/Computer';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SecurityIcon from '@mui/icons-material/Security';
import CloudIcon from '@mui/icons-material/Cloud';
import EmailIcon from '@mui/icons-material/Email';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import PublicIcon from '@mui/icons-material/Public';
import BusinessIcon from '@mui/icons-material/Business';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SportsGolf from '@mui/icons-material/SportsGolf';


// 아이콘 매핑 객체
export const iconMap: { [key: string]: React.ReactNode } = {
  folder: <FolderIcon />,
  work: <WorkIcon />,
  home: <HomeIcon />,
  finance: <AccountBalanceIcon />,
  shopping: <ShoppingCartIcon />,
  social: <PeopleIcon />,
  entertainment: <TheatersIcon />,
  travel: <FlightIcon />,
  education: <SchoolIcon />,
  health: <LocalHospitalIcon />,
  golf: <SportsGolf />,
  // 추가된 아이콘
  computer: <ComputerIcon />,
  games: <SportsEsportsIcon />,
  food: <RestaurantIcon />,
  fitness: <FitnessCenterIcon />,
  money: <AttachMoneyIcon />,
  creditcard: <CreditCardIcon />,
  security: <SecurityIcon />,
  cloud: <CloudIcon />,
  email: <EmailIcon />,
  mobile: <PhoneAndroidIcon />,
  web: <PublicIcon />,
  business: <BusinessIcon />,
  library: <LocalLibraryIcon />,
  music: <MusicNoteIcon />,
  car: <DirectionsCarIcon />,
  favorite: <FavoriteIcon />,
};

// 카테고리 아이콘 가져오기 함수
export const getCategoryIcon = (iconName: string | undefined, props?: any, color?: string): React.ReactElement => {
  if (!iconName || !iconMap[iconName]) {
    return <CategoryIcon style={{ color: color || 'inherit' }} {...props} />;
  }
  
  const IconComponent = iconMap[iconName];
  // props를 복제하여 아이콘 컴포넌트에 적용하고 색상 추가
  return React.cloneElement(
    IconComponent as React.ReactElement, 
    { 
      ...props,
      style: { ...((props?.style as object) || {}), color: color || 'inherit' }
    }
  );
};

// 사용 가능한 아이콘 목록
export const AVAILABLE_ICONS = [
  { value: 'folder', label: '폴더', icon: <FolderIcon /> },
  { value: 'work', label: '업무', icon: <WorkIcon /> },
  { value: 'home', label: '집', icon: <HomeIcon /> },
  { value: 'finance', label: '금융', icon: <AccountBalanceIcon /> },
  { value: 'shopping', label: '쇼핑', icon: <ShoppingCartIcon /> },
  { value: 'social', label: '소셜', icon: <PeopleIcon /> },
  { value: 'entertainment', label: '엔터테인먼트', icon: <TheatersIcon /> },
  { value: 'travel', label: '여행', icon: <FlightIcon /> },
  { value: 'education', label: '교육', icon: <SchoolIcon /> },
  { value: 'health', label: '건강', icon: <LocalHospitalIcon /> },
  { value: 'golf', label: '골프', icon: <SportsGolf /> },
  // 추가된 아이콘
  { value: 'computer', label: '컴퓨터', icon: <ComputerIcon /> },
  { value: 'games', label: '게임', icon: <SportsEsportsIcon /> },
  { value: 'food', label: '음식', icon: <RestaurantIcon /> },
  { value: 'fitness', label: '피트니스', icon: <FitnessCenterIcon /> },
  { value: 'money', label: '돈', icon: <AttachMoneyIcon /> },
  { value: 'creditcard', label: '신용카드', icon: <CreditCardIcon /> },
  { value: 'security', label: '보안', icon: <SecurityIcon /> },
  { value: 'cloud', label: '클라우드', icon: <CloudIcon /> },
  { value: 'email', label: '이메일', icon: <EmailIcon /> },
  { value: 'mobile', label: '모바일', icon: <PhoneAndroidIcon /> },
  { value: 'web', label: '웹', icon: <PublicIcon /> },
  { value: 'business', label: '비즈니스', icon: <BusinessIcon /> },
  { value: 'library', label: '도서관', icon: <LocalLibraryIcon /> },
  { value: 'music', label: '음악', icon: <MusicNoteIcon /> },
  { value: 'car', label: '자동차', icon: <DirectionsCarIcon /> },
  { value: 'favorite', label: '즐겨찾기', icon: <FavoriteIcon /> }
];
