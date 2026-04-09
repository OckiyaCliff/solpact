use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod solpact {
    use super::*;

    pub fn create_campaign(
        ctx: Context<CreateCampaign>,
        campaign_id: [u8; 16],
        target_amount: u64,
        deadline: i64,
        project_type: u8,
        category: [u8; 32],
    ) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        campaign.authority = ctx.accounts.authority.key();
        campaign.verifier = ctx.accounts.verifier.key();
        campaign.target_amount = target_amount;
        campaign.raised_amount = 0;
        campaign.deadline = deadline;
        campaign.project_type = project_type;
        campaign.category = category;
        campaign.state = 0; // Created
        campaign.campaign_id = campaign_id;
        campaign.bump = ctx.bumps.campaign;
        campaign.vault_bump = ctx.bumps.vault;
        Ok(())
    }

    pub fn donate(ctx: Context<Donate>, amount: u64) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        
        let cpi_accounts = Transfer {
            from: ctx.accounts.donor.to_account_info(),
            to: ctx.accounts.vault.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(ctx.accounts.system_program.to_account_info(), cpi_accounts);
        transfer(cpi_ctx, amount)?;

        campaign.raised_amount += amount;
        
        // If target met, set to Active (or Funded based on logic)
        if campaign.state == 0 && campaign.raised_amount > 0 {
             campaign.state = 1; // Active
        }

        Ok(())
    }

    pub fn verify_project(ctx: Context<VerifyProject>, proof_cid: String) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        require!(campaign.state == 1, SolpactError::InvalidState);
        
        campaign.state = 2; // Funded/Verified
        // proof_cid handling if we had space, but for now we just log it or store in off-chain
        msg!("Project verified with proof CID: {}", proof_cid);
        
        Ok(())
    }

    pub fn claim_bounty(ctx: Context<ClaimBounty>) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        require!(campaign.state == 2, SolpactError::InvalidState);
        
        let amount = campaign.raised_amount;
        let fee = (amount as f128 * 0.025) as u64; // 2.5% fee
        let net_amount = amount - fee;

        // Transfer fee to treasury (simplified as authority for now or specific treasury PDA)
        let seeds = &[
            b"vault",
            campaign.to_account_info().key.as_ref(),
            &[campaign.vault_bump],
        ];
        let signer = &[&seeds[..]];

        // Transfer net amount to host
        let cpi_accounts_host = Transfer {
            from: ctx.accounts.vault.to_account_info(),
            to: ctx.accounts.authority.to_account_info(),
        };
        let cpi_ctx_host = CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(),
            cpi_accounts_host,
            signer,
        );
        transfer(cpi_ctx_host, net_amount)?;

        // Transfer fee to treasury
        let cpi_accounts_fee = Transfer {
            from: ctx.accounts.vault.to_account_info(),
            to: ctx.accounts.treasury.to_account_info(),
        };
        let cpi_ctx_fee = CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(),
            cpi_accounts_fee,
            signer,
        );
        transfer(cpi_ctx_fee, fee)?;

        campaign.state = 3; // Disbursed
        Ok(())
    }

    pub fn refund(ctx: Context<Refund>) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        let Clock { unix_timestamp, .. } = Clock::get()?;
        
        require!(unix_timestamp > campaign.deadline, SolpactError::DeadlineNotReached);
        require!(campaign.raised_amount < campaign.target_amount, SolpactError::TargetMet);
        
        // Implementation for pro-rata refund would require tracking individual donations
        // For MVP, we'll allow donors to claim their individual share if we had a Donation account
        // Since we don't track donors on-chain for gas efficiency in MVP, we might need a different approach
        // or just let admin trigger it. For now, mark as Expired.
        campaign.state = 4; // Expired
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(campaign_id: [u8; 16])]
pub struct CreateCampaign<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: designated verifier
    pub verifier: UncheckedAccount<'info>,
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 8 + 8 + 8 + 1 + 32 + 1 + 16 + 1 + 1,
        seeds = [b"campaign", authority.key().as_ref(), campaign_id.as_ref()],
        bump
    )]
    pub campaign: Account<'info, Campaign>,
    #[account(
        mut,
        seeds = [b"vault", campaign.key().as_ref()],
        bump
    )]
    pub vault: SystemAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Donate<'info> {
    #[account(mut)]
    pub donor: Signer<'info>,
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,
    #[account(
        mut,
        seeds = [b"vault", campaign.key().as_ref()],
        bump = campaign.vault_bump
    )]
    pub vault: SystemAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct VerifyProject<'info> {
    pub verifier: Signer<'info>,
    #[account(
        mut,
        has_one = verifier,
    )]
    pub campaign: Account<'info, Campaign>,
}

#[derive(Accounts)]
pub struct ClaimBounty<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        mut,
        has_one = authority,
    )]
    pub campaign: Account<'info, Campaign>,
    #[account(
        mut,
        seeds = [b"vault", campaign.key().as_ref()],
        bump = campaign.vault_bump
    )]
    pub vault: SystemAccount<'info>,
    /// CHECK: Platform treasury
    #[account(mut)]
    pub treasury: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Refund<'info> {
    #[account(mut)]
    pub donor: Signer<'info>,
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,
    #[account(
        mut,
        seeds = [b"vault", campaign.key().as_ref()],
        bump = campaign.vault_bump
    )]
    pub vault: SystemAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Campaign {
    pub authority: Pubkey,
    pub verifier: Pubkey,
    pub target_amount: u64,
    pub raised_amount: u64,
    pub deadline: i64,
    pub project_type: u8,
    pub category: [u8; 32],
    pub state: u8,
    pub campaign_id: [u8; 16],
    pub vault_bump: u8,
    pub bump: u8,
}

#[error_code]
pub enum SolpactError {
    #[msg("Invalid campaign state for this action")]
    InvalidState,
    #[msg("Deadline has not been reached yet")]
    DeadlineNotReached,
    #[msg("Target amount was already met")]
    TargetMet,
}
