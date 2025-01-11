import { redirect } from 'next/navigation';
import { requireAuth, logout } from '@/lib/auth';
import { User } from '@/models/User';
import { connectDB } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: { message?: string };
}) {
  const session = await requireAuth();
  const message = (await searchParams).message;

  async function handleUpdateProfile(formData: FormData) {
    'use server';

    const name = formData.get('name') as string;
    const profileImage = formData.get('profileImage') as string;

    try {
      await connectDB();
      await User.findByIdAndUpdate(session.id, {
        name,
        profileImage,
      });

      revalidatePath('/profile');
    } catch (error) {
      console.error('Update error:', error);
      redirect('/profile?message=Failed to update profile');
    } finally {
      redirect('/profile?message=Profile updated successfully');
    }
  }

  async function handleLogout() {
    'use server';
    await logout();
    redirect('/');
  }

  // Fetch current user data
  await connectDB();
  const user = await User.findById(session.id);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Profile</h1>

        {message && (
          <div className={`mb-4 p-4 rounded-md ${
            message.includes('success')
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}

        <div className="mb-6">
          <img
            src={user.profileImage || `https://ui-avatars.com/api/?background=random&name=${user.name}`}
            alt={user.name}
            className="w-32 h-32 rounded-full mx-auto"
          />
        </div>

        <form action={handleUpdateProfile} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              name="name"
              defaultValue={user.name}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            />
          </div>

          <div>
            <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700">
              Profile Image URL
            </label>
            <input
              type="url"
              name="profileImage"
              defaultValue={user.profileImage}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Update Profile
          </button>
        </form>

        <form action={handleLogout} className="mt-4">
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Logout
          </button>
        </form>
      </div>
    </div>
  );
}
