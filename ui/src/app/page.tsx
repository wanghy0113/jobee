"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button, buttonVariants } from "@/components/ui/button";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useJob } from "./context/job-context";
import { useSession } from "./context/session-context";

const beeLogoSvg = `<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
<path
  d="M192.139 108.22L147.197 59.2017L147.063 59.3279C145.975 50.2839 142.33 42.0141 136.874 35.2583L151.83 15.1691C154.662 11.354 153.884 5.95107 150.064 3.11039C146.236 0.269717 140.846 1.06145 138.001 4.88092L123.772 24.0044C116.764 19.9195 108.616 17.5704 99.937 17.5704C91.3062 17.5704 83.1975 19.8891 76.2154 23.9391L62.0294 4.88092C59.1931 1.06145 53.7858 0.269717 49.9664 3.11039C46.1512 5.95542 45.3551 11.3584 48.2002 15.1691L63.0778 35.1582C57.5835 41.9141 53.9207 50.2012 52.8201 59.267L52.7461 59.2017L7.85651 108.22C2.45792 114.11 -0.317503 121.762 0.0305119 129.757C0.382877 137.749 3.83258 145.122 9.72709 150.525C15.2649 155.598 22.4557 158.399 29.9598 158.399C30.3992 158.399 30.8386 158.39 31.2736 158.369C39.2692 158.021 46.6428 154.58 52.0501 148.672L55.1213 145.314C60.6765 161.17 74.4275 173.194 91.428 176.274V189.973C91.428 194.732 95.3258 198.591 100.089 198.591C104.853 198.591 108.742 194.723 108.742 189.973V176.239C125.525 173.111 139.245 161.066 144.766 145.201L147.946 148.672C153.344 154.571 160.731 158.012 168.722 158.369C169.162 158.386 169.597 158.399 170.04 158.399C177.553 158.399 184.731 155.593 190.269 150.525C196.159 145.122 199.604 137.744 199.965 129.753C200.326 121.762 197.538 114.11 192.139 108.22ZM42.4753 139.941C39.3997 143.295 35.2279 145.257 30.6907 145.457L29.9511 145.47C25.6923 145.47 21.6075 143.887 18.4666 141.007C15.1083 137.932 13.1507 133.742 12.9549 129.205C12.7592 124.663 14.3383 120.318 17.4095 116.972L52.4634 78.6558V129.018L42.4753 139.941ZM130.075 129.597H69.7815V107.946H130.075V129.597ZM130.075 86.6166H69.7815V64.9701H130.075V86.6166ZM187.045 129.188C186.849 133.729 184.896 137.923 181.534 140.994C178.384 143.878 174.312 145.457 170.04 145.457L169.292 145.444C164.755 145.244 160.522 143.291 157.46 139.933L147.38 128.957V78.5557L182.578 116.951C185.658 120.305 187.245 124.65 187.045 129.188Z"
  fill="black" />
</svg>`;

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const image1Ref = useRef<HTMLImageElement>(null);
  const image2Ref = useRef<HTMLImageElement>(null);
  const image3Ref = useRef<HTMLImageElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const beeRef = useRef<HTMLImageElement>(null);

  const [jobTitle, setJobTitle] = useState("");
  const [jobLocation, setJobLocation] = useState("");

  const { createJobSearch } = useJob();

  const router = useRouter();
  const { jobSearch } = useJob();
  const { session } = useSession();

  const animateBee = useCallback(() => {
    flyBee(image1Ref.current!, 10, 20);
    setTimeout(() => {
      flyBee(image2Ref.current!, -20, 0);
      setTimeout(() => {
        flyBee(image3Ref.current!, -30, 0);
        setTimeout(() => {
          flyBee(logoRef.current!, 1, 0);
        }, 2000);
      }, 2000);
    }, 2000);
  }, []);

  useEffect(() => {
    if (!beeRef.current || !logoRef.current) {
      return;
    }

    const bee = beeRef.current;
    const logo = logoRef.current;
    if (bee && logo) {
      const logoRect = logo.getBoundingClientRect();
      const beeRect = bee.getBoundingClientRect();
      const beeNewLeft = logoRect.right + 4; // Adjust the value as needed
      const beeNewTop = logoRect.top - 4;
      bee.style.display = "block";
      bee.style.left = `${beeNewLeft}px`;
      bee.style.top = `${beeNewTop}px`;
      bee.style.transform = `rotate(${45}deg)`;
    }

    const interval = setInterval(() => {
      animateBee();
    }, 10000);
    return () => clearInterval(interval);
  }, [animateBee]);

  const flyBee = (toElement: HTMLElement, offsetX: number, offsetY: number) => {
    if (!beeRef.current || !image1Ref.current) {
      return;
    }

    const bee = beeRef.current;

    const beeRect = bee.getBoundingClientRect();
    const toElementRect = toElement.getBoundingClientRect();

    const newLeft =
      offsetX > 0
        ? toElementRect.right + offsetX
        : toElementRect.left + offsetX;
    const newTop =
      offsetY >= 0
        ? toElementRect.top + offsetY
        : toElementRect.bottom + offsetY;

    // Calculate angle of rotation
    const deltaX = newLeft - beeRect.left;
    const deltaY = newTop - beeRect.top;
    const angle = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;

    bee.style.transition = "left 0.5s, top 0.5s, transform 0.5s";
    bee.style.left = `${newLeft}px`;
    bee.style.top = `${newTop}px`;
    bee.style.transform = `rotate(${270 - angle}deg)`;
  };

  return (
    <main className="min-h-screen relative" ref={containerRef}>
      <Image
        ref={beeRef}
        src="/bee-icon.svg"
        className="absolute top-0 left-0 hidden"
        alt="logo"
        width={30}
        height={30}
      />
      <header className="flex flex-row p-5 w-full">
        <div>
          <Image
            ref={logoRef}
            src="/logo-without-icon.png"
            alt="logo"
            width={80}
            height={40}
          />
        </div>
        {!session && (
          <div className="flex flex-row ml-auto space-x-6">
            <Button
              variant={"ghost"}
              onClick={() => {
                router.push(`/app/account`);
              }}
            >
              Sign Up
            </Button>
            <Button
              onClick={() => {
                router.push(`/app/account`);
              }}
            >
              Log in
            </Button>
          </div>
        )}
        {session && (
          <div className="flex flex-row ml-auto space-x-6">
            <Button
              onClick={() => {
                router.push(`/app/account`);
              }}
            >
              Dashboard
            </Button>
          </div>
        )}
      </header>
      <div className="flex flex-col mt-20 w-full justify-center">
        <div className="flex flex-col justify-center">
          <h1 className="text-5xl font-bold text-center">
            The ultimate job search engine
          </h1>
          <p className="text-xl font-normal mt-4 text-center">
            Jobee will scoure every corner for jobs, so you don&apos;t have to.
            Plus more!
          </p>
        </div>
      </div>
      <div className="w-full relative h-80 mt-8">
        {!jobSearch && (
          <div className="flex flex-col space-y-4 justify-center max-w-96 mx-auto">
            <Textarea
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Software engineer"
              className="w-1/2"
              rows={1}
            ></Textarea>
            <Textarea
              onChange={(e) => setJobLocation(e.target.value)}
              placeholder="San Francisco, CA"
              className="w-1/2"
              rows={1}
            ></Textarea>
            <Button
              onClick={() => {
                if (!jobTitle || !jobLocation) {
                  return;
                }
                const jobSearch = {
                  jobTitle,
                  jobLocation,
                };
                createJobSearch({
                  jobTitle,
                  jobLocation,
                });
                router.push("/app");
              }}
              className={buttonVariants()}
            >
              Search
            </Button>
          </div>
        )}
        {jobSearch && (
          <div className="flex flex-col space-y-4 justify-center items-center max-w-96 mx-auto">
            <h3 className="font-semibold text-base">Your last search:</h3>
            <p className="text-gray-600 italic">
              {jobSearch.jobTitle} in {jobSearch.jobLocation}
            </p>
            <Button
              onClick={() => {
                router.push("/app");
              }}
              className={buttonVariants()}
            >
              See my jobs
            </Button>
          </div>
        )}
        <div className="absolute w-full top-0 left-0 h-80 -z-10">
          <Image
            ref={image1Ref}
            className="absolute top-0 left-20 rotate-12 select-none"
            src="/glassdoor-logo.png"
            alt="search"
            width={120}
            height={120}
          />

          <Image
            ref={image2Ref}
            className="absolute top-60 left-20 -rotate-12 select-none"
            src="/linkedin-logo.png"
            alt="search"
            width={120}
            height={120}
          />

          <Image
            ref={image3Ref}
            className="absolute top-40 right-20 rotate-6 select-none"
            src="/indeed-logo.png"
            alt="search"
            width={120}
            height={120}
          />
        </div>
      </div>
    </main>
  );
}
