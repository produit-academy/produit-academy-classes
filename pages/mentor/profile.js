import { withAuth } from '../../lib/auth';
import ProfilePage from '../../components/ProfilePage';

function MentorProfile() {
    return <ProfilePage pageTitle="My Profile" allowedRole="mentor" />;
}

export default withAuth(MentorProfile, ['mentor', 'admin']);
