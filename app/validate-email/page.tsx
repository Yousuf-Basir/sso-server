import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export default async function ValidateEmailPage({
  searchParams,
}: {
  searchParams: { message?: string };
}) {
  async function validateEmail(formData: FormData) {
    'use server';
    
    const email = formData.get('email');
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/validate-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    const data = await response.json();
    
    // Revalidate the page with the new message
    revalidatePath('/validate-email');
    
    // Redirect using redirect() function from next/navigation
    redirect(`/validate-email?message=${encodeURIComponent(data.message)}`);
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Email Validator</h1>
        
        <form action={validateEmail} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              placeholder="Enter your email"
            />
          </div>
          
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Validate Email
          </button>
        </form>
        
        {searchParams.message && (
          <div className={`mt-4 p-4 rounded-md ${
            searchParams.message.includes('valid') 
              ? 'bg-green-50 text-green-700' 
              : 'bg-red-50 text-red-700'
          }`}>
            {searchParams.message}
          </div>
        )}
      </div>
    </div>
  );
}
