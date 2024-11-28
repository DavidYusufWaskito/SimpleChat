import { useState,useEffect } from "react";
export default function NavigationLayout({ children,auth }) {
    return (
        <div className="fixed bottom-0 w-full px-20 md:px-96 bg-white dark:bg-gray-800">
            <div className="flex justify-between gap-10 w-full p-6 md:p-8">
                {children}
            </div>
        </div>
    );
}