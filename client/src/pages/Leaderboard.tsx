import { useLeaderboard } from "@/hooks/use-games";
import { Navbar } from "@/components/Navbar";
import { Loader2, Medal, Trophy } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function Leaderboard() {
  const { data: leaders, isLoading } = useLeaderboard();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center gap-3 mb-8">
            <Trophy className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight text-center">Wall Street Legends</h1>
          </div>

          <Card className="border-white/10 bg-card/50 shadow-2xl overflow-hidden">
            <CardHeader className="bg-secondary/30 border-b border-white/5">
              <CardTitle className="text-center text-xl font-mono uppercase tracking-widest text-muted-foreground">Top Performers</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-white/5">
                      <TableHead className="w-[100px] text-center">Rank</TableHead>
                      <TableHead>Trader</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaders?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                          No legends yet. Be the first!
                        </TableCell>
                      </TableRow>
                    ) : (
                      leaders?.map((leader, index) => (
                        <TableRow key={leader.username} className="border-white/5 hover:bg-white/5 transition-colors">
                          <TableCell className="font-medium text-center">
                            {index === 0 ? (
                              <Medal className="h-6 w-6 text-yellow-500 mx-auto" />
                            ) : index === 1 ? (
                              <Medal className="h-6 w-6 text-gray-400 mx-auto" />
                            ) : index === 2 ? (
                              <Medal className="h-6 w-6 text-amber-700 mx-auto" />
                            ) : (
                              <span className="text-muted-foreground font-mono">#{index + 1}</span>
                            )}
                          </TableCell>
                          <TableCell className="font-semibold text-lg">{leader.username}</TableCell>
                          <TableCell className="text-right font-mono font-bold text-primary">
                            {leader.score.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
