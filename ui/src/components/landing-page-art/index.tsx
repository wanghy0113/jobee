import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { UserProfile } from "@/types/user-profile";
import classNames from "classnames";
import Image from "next/image";
import {
  SVG,
  Svg,
  extend as SVGextend,
  Element as SVGElement,
  Timeline as SVGTimeline,
} from "@svgdotjs/svg.js";
import { Button } from "../ui/button";

export interface LandingPageArtProps {
  beeEnrouteX: number;
  animationIntervalMs: number;
  onAnimationStart: () => void;
  onAnimationEnd: () => void;
}

export const LandingPageArt = ({
  beeEnrouteX,
  onAnimationStart,
  onAnimationEnd,
  animationIntervalMs,
}: LandingPageArtProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const image1Ref = useRef<HTMLImageElement>(null);
  const image2Ref = useRef<HTMLImageElement>(null);
  const image3Ref = useRef<HTMLImageElement>(null);

  console.log("render");

  const runAnimation = useCallback(() => {
    if (
      !containerRef.current ||
      !image1Ref.current ||
      !image2Ref.current ||
      !image3Ref.current
    ) {
      return;
    }

    const canvas = containerRef.current.querySelector("svg");

    if (!canvas) {
      const draw = SVG().addTo(containerRef.current).size("100%", "100%");
      const { x: x1, y: y1 } = image1Ref.current.getBoundingClientRect();
      const { x: x2, y: y2 } = image2Ref.current.getBoundingClientRect();
      const { x: x3, y: y3 } = image3Ref.current.getBoundingClientRect();

      console.log("x1", x1, "y1", y1);
      console.log("x2", x2, "y2", y2);
      console.log("x3", x3, "y3", y3);

      const parentRect = containerRef.current.getBoundingClientRect();

      const relativeX1 = x1 - parentRect.left;
      const relativeY1 = y1 - parentRect.top;
      const relativeX2 = x2 - parentRect.left;
      const relativeY2 = y2 - parentRect.top;
      const relativeX3 = x3 - parentRect.left;
      const relativeY3 = y3 - parentRect.top;

      const rect = draw.rect(50, 50).move(relativeX1, relativeY1).fill("red");

      // Animate the rectangle to the second and then to the third image
      rect
        .animate(500)
        .move(relativeX2, relativeY2)
        .animate(500)
        .move(relativeX3, relativeY3)
        .animate(500)
        .move(beeEnrouteX, 0)
        .after(() => {
          draw.remove();
        });
    }
  }, [containerRef, image1Ref, image2Ref, image3Ref]);

  return (
    <div ref={containerRef} className="absolute w-full top-0 left-0 h-80">
      <Button onClick={runAnimation}>Run Animation</Button>
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
  );
};
