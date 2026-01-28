import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, UserPlus, Trash2, CheckCircle2, XCircle } from "lucide-react";

export default function AdminUsers() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [bulkEmails, setBulkEmails] = useState("");
  const [inviteResults, setInviteResults] = useState([]);
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => base44.entities.User.list(),
  });

  const inviteMutation = useMutation({
    mutationFn: ({ email, role }) => base44.users.inviteUser(email, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const handleInviteSingle = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      await inviteMutation.mutateAsync({ email, role });
      setInviteResults([{ email, success: true, message: "Convite enviado" }]);
      setEmail("");
    } catch (error) {
      setInviteResults([{ email, success: false, message: error.message }]);
    }
  };

  const handleInviteBulk = async () => {
    const emails = bulkEmails
      .split("\n")
      .map((e) => e.trim())
      .filter((e) => e && e.includes("@"));

    if (emails.length === 0) return;

    const results = [];
    for (const email of emails) {
      try {
        await base44.users.inviteUser(email, role);
        results.push({ email, success: true, message: "Convite enviado" });
      } catch (error) {
        results.push({ email, success: false, message: error.message });
      }
    }

    setInviteResults(results);
    setBulkEmails("");
    queryClient.invalidateQueries({ queryKey: ["users"] });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Gerenciar Usuários</h1>
          <p className="text-stone-600">Convide usuários para acessar o aplicativo</p>
        </div>

        {/* Convite Individual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" style={{ color: "#722f37" }} />
              Convidar Usuário
            </CardTitle>
            <CardDescription>Envie um convite para um único usuário</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInviteSingle} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Input
                    type="email"
                    placeholder="email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuário</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                disabled={inviteMutation.isPending}
                className="w-full text-white"
                style={{ backgroundColor: "#722f37" }}
              >
                {inviteMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar Convite"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Convite em Massa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" style={{ color: "#722f37" }} />
              Convite em Massa
            </CardTitle>
            <CardDescription>Cole uma lista de emails (um por linha)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              className="w-full h-32 p-3 border rounded-lg font-mono text-sm"
              placeholder="usuario1@email.com&#10;usuario2@email.com&#10;usuario3@email.com"
              value={bulkEmails}
              onChange={(e) => setBulkEmails(e.target.value)}
            />
            <div className="flex gap-2">
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleInviteBulk}
                disabled={inviteMutation.isPending}
                className="flex-1 text-white"
                style={{ backgroundColor: "#722f37" }}
              >
                Enviar Todos os Convites
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resultados dos Convites */}
        {inviteResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Resultados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {inviteResults.map((result, idx) => (
                  <Alert
                    key={idx}
                    className={
                      result.success
                        ? "border-green-200 bg-green-50"
                        : "border-red-200 bg-red-50"
                    }
                  >
                    <AlertDescription className="flex items-center gap-2">
                      {result.success ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className="font-mono text-sm">{result.email}</span>
                      <span
                        className={`text-xs ${
                          result.success ? "text-green-700" : "text-red-700"
                        }`}
                      >
                        {result.message}
                      </span>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Usuários */}
        <Card>
          <CardHeader>
            <CardTitle>Usuários Cadastrados ({users.length})</CardTitle>
            <CardDescription>Usuários com acesso ao aplicativo</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
              </div>
            ) : (
              <div className="space-y-2">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-stone-50 rounded-lg"
                  >
                    <div>
                      <div className="font-semibold text-stone-900">{user.full_name}</div>
                      <div className="text-sm text-stone-600">{user.email}</div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {user.role === "admin" ? "Administrador" : "Usuário"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Alert className="border-blue-200 bg-blue-50">
          <AlertDescription className="text-blue-800 text-sm">
            <strong>Nota:</strong> Os usuários receberão um email de convite com link para
            criar senha. Após a publicação, a confirmação por email pode ser desativada nas
            configurações do dashboard Base44.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}