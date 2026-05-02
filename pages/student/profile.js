import { withAuth } from '../../lib/auth';
import ProfilePage from '../../components/ProfilePage';

function StudentProfile() {
    return <ProfilePage pageTitle="My Profile" allowedRole="student" />;
}

export default withAuth(StudentProfile, ['student']);
