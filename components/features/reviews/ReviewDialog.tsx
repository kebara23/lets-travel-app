"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Plane, Bed } from "lucide-react";

interface ReviewDialogProps {
  links?: {
    google?: string;
    tripadvisor?: string;
    booking?: string;
  };
  className?: string;
  style?: React.CSSProperties;
}

export function ReviewDialog({
  links = {
    google: "https://goo.gl/maps/placeholder",
    tripadvisor: "https://tripadvisor.com/placeholder",
    booking: "https://booking.com/placeholder",
  },
  className,
  style,
}: ReviewDialogProps) {
  const platforms = [
    {
      name: "Google Maps",
      icon: MapPin,
      url: links.google,
      color: "text-red-500",
      bgColor: "bg-red-50 hover:bg-red-100",
      borderColor: "border-red-100",
    },
    {
      name: "TripAdvisor",
      icon: Plane, // Using Plane as requested approximation
      url: links.tripadvisor,
      color: "text-green-600",
      bgColor: "bg-green-50 hover:bg-green-100",
      borderColor: "border-green-100",
    },
    {
      name: "Booking.com",
      icon: Bed,
      url: links.booking,
      color: "text-blue-600",
      bgColor: "bg-blue-50 hover:bg-blue-100",
      borderColor: "border-blue-100",
    },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className={className} style={style}>
          <Card className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-luxury/20 hover:border-luxury/40 bg-card h-full">
            <CardContent className="p-6 flex flex-col items-center justify-center space-y-4 min-h-[160px]">
              <div className="space-y-2 text-center">
                <h3 className="font-serif text-xl text-primary font-medium">
                  Loving your stay?
                </h3>
                <div className="flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="h-5 w-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground font-body">
                  Share the magic with the world.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center font-serif text-2xl text-primary">
            Where would you like to review us?
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Your feedback helps us craft even better experiences.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 py-4">
          {platforms.map((platform) => (
            platform.url && (
              <Button
                key={platform.name}
                variant="outline"
                className={`h-auto py-4 flex items-center justify-start gap-4 border-2 ${platform.borderColor} ${platform.bgColor} transition-all duration-200 group`}
                onClick={() => window.open(platform.url, "_blank")}
              >
                <div className={`p-2 rounded-full bg-white ${platform.color}`}>
                  <platform.icon className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <span className={`block text-lg font-semibold ${platform.color}`}>
                    {platform.name}
                  </span>
                  <span className="text-xs text-muted-foreground group-hover:text-slate-600">
                    Write a review on {platform.name}
                  </span>
                </div>
              </Button>
            )
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}






