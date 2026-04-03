import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { jwtVerify } from "jose";

export const useAuth = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [authenticating, setAuthenticating] = useState(true);

  useEffect(() => {
    const verifyToken = async (token: string) => {
      try {
        if (!process.env.NEXT_PUBLIC_JWT_SECRET) {
          console.error('NEXT_PUBLIC_JWT_SECRET is not defined');
          throw new Error('NEXT_PUBLIC_JWT_SECRET is not defined in environment variables');
        }
        const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);

        const currentTime = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < currentTime) {
          console.error('Token has expired');
          throw new Error('Token has expired');
        }

        console.log('Token verified successfully');
        setAuthenticating(false);
      } catch (error) {
        console.error("Error verifying token:", error);
        redirectToLogin();
      }
    };

    const redirectToLogin = () => {
      const callbackUrl = encodeURIComponent(pathname);
      console.log('Redirecting to login with callback URL:', callbackUrl);
      router.push(`/login?callbackUrl=${callbackUrl}`);
    };

    const authToken = Cookies.get("AUTH_TOKEN");
    console.log('AUTH_TOKEN cookie present:', !!authToken);
    
    if (!authToken) {
      console.log('No AUTH_TOKEN found, redirecting to login');
      redirectToLogin();
    } else {
      console.log('AUTH_TOKEN found, verifying...');
      verifyToken(authToken);
    }
  }, [router, pathname]);

  return { authenticating };
};