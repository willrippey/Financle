import { db } from "./server/db";
import { companies } from "./shared/schema";
import * as fs from "fs";

async function generateInserts() {
  const allCompanies = await db.select().from(companies).orderBy(companies.id);
  
  let sql = "-- INSERT statements for companies table\n";
  sql += "-- Run these in the production database SQL runner\n\n";
  
  for (const company of allCompanies) {
    const escapedName = company.name.replace(/'/g, "''");
    const escapedSubIndustry = company.subIndustry.replace(/'/g, "''");
    const escapedHeadquarters = company.headquarters.replace(/'/g, "''");
    const escapedDescription = company.description.replace(/'/g, "''");
    
    sql += `INSERT INTO companies (id, symbol, name, sector, sub_industry, headquarters, founded, description, market_cap) VALUES (${company.id}, '${company.symbol}', '${escapedName}', '${company.sector}', '${escapedSubIndustry}', '${escapedHeadquarters}', '${company.founded}', '${escapedDescription}', '${company.marketCap}');\n`;
  }
  
  fs.writeFileSync("companies_insert.sql", sql);
  console.log(`Generated ${allCompanies.length} INSERT statements to companies_insert.sql`);
}

generateInserts().catch(console.error);
