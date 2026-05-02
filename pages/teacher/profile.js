import { withAuth } from '../../lib/auth';
import ProfilePage from '../../components/ProfilePage';

function TeacherProfile() {
    return <ProfilePage pageTitle="My Profile" allowedRole="teacher" />;
}

export default withAuth(TeacherProfile, ['teacher', 'admin']);
