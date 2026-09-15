import { prisma } from "../lib/prisma";

// シードデータ: 開発用の初期データ
async function main() {
  console.log("🌱 シードデータの投入を開始...");

  // チームの作成
  const team1 = await prisma.team.create({
    data: {
      name: "My Workspace",
    },
  });

  const team2 = await prisma.team.create({
    data: {
      name: "DevOps Team",
    },
  });

  console.log(`✅ ${2} チームを作成しました`);

  // デモ用プロジェクト1: フロントエンドアプリ
  const project1 = await prisma.project.create({
    data: {
      name: "Frontend-App-v1.0",
      fileName: "package-lock.json",
      status: "completed",
      pkgCount: 124,
      teamId: team1.id,
    },
  });

  // デモ用プロジェクト2: バックエンドAPI
  await prisma.project.create({
    data: {
      name: "Backend-API-v2.3",
      fileName: "package-lock.json",
      status: "completed",
      pkgCount: 89,
      teamId: team2.id,
    },
  });

  console.log(`✅ ${2} プロジェクトを作成しました`);

  // プロジェクト1のパッケージ
  const lodash = await prisma.package.create({
    data: {
      name: "lodash",
      version: "4.17.20",
      isDirect: true,
      projectId: project1.id,
    },
  });

  const axios = await prisma.package.create({
    data: {
      name: "axios",
      version: "0.21.1",
      isDirect: true,
      projectId: project1.id,
    },
  });

  const followRedirects = await prisma.package.create({
    data: {
      name: "follow-redirects",
      version: "1.14.0",
      isDirect: false,
      projectId: project1.id,
    },
  });

  // 依存関係: axios → follow-redirects
  await prisma.packageDependency.create({
    data: {
      dependerId: axios.id,
      dependeeId: followRedirects.id,
    },
  });

  console.log(`✅ ${3} パッケージを作成しました`);

  // 脆弱性の追加
  await prisma.vulnerability.create({
    data: {
      severity: "high",
      cve: "CVE-2021-23337",
      title: "Prototype Pollution in lodash",
      description:
        "lodash versions prior to 4.17.21 are vulnerable to Prototype Pollution via the setWith and set functions.",
      fixedIn: "4.17.21",
      url: "https://nvd.nist.gov/vuln/detail/CVE-2021-23337",
      packageId: lodash.id,
    },
  });

  await prisma.vulnerability.create({
    data: {
      severity: "medium",
      cve: "CVE-2022-0155",
      title: "SSRF in follow-redirects",
      description:
        "follow-redirects is vulnerable to Exposure of Sensitive Information to an Unauthorized Actor.",
      fixedIn: "1.14.7",
      url: "https://nvd.nist.gov/vuln/detail/CVE-2022-0155",
      packageId: followRedirects.id,
    },
  });

  console.log(`✅ ${2} 脆弱性を作成しました`);

  console.log("🎉 シード完了！");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ シードエラー:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
