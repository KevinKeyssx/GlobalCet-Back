import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Query,
    UseGuards
}                       from '@nestjs/common';
import { ApiHeader }    from '@nestjs/swagger';

import { Quote } from '@prisma/client';

import { QuotesService }            from './quotes.service';
import { IQuoteStockResponse }      from './interfaces/quote-stocks.interface';
import { CreateQuoteDto }           from './dto/create-quote.dto';
import { UpdateQuoteDto }           from './dto/update-quote.dto';
import { QuotePaginationFilterDto } from './dto/quote-pagination-filter.dto';
import { UpdateQuoteStatusDto }     from './dto/update-quote-status.dto';
import { PaginatedResult }          from '@common/interfaces/paginated-result.interface';
import { SecretGuard }              from '@common/guards/secret.guard';


@UseGuards( SecretGuard )
@Controller( 'quotes' )
@ApiHeader({
    name : 'x-secret',
    description : 'Secret key to authenticate requests',
    required : true
})
export class QuotesController {

	constructor( private readonly quotesService: QuotesService ) {}


	@Post()
	create( @Body() createQuoteDto: CreateQuoteDto ): Promise<Quote> {
		return this.quotesService.create( createQuoteDto );
	}


	@Get()
	findAll( @Query() filterDto: QuotePaginationFilterDto ): Promise<PaginatedResult<Quote>> {
		return this.quotesService.findAll( filterDto );
	}


	@Get( ':id' )
	findOne( @Param( 'id' ) id: string ): Promise<Quote> {
		return this.quotesService.findOne( id );
	}


	@Get(':id/stocks')
	getStocks(
		@Param('id') id: string,
		@Query() updateQuoteStatusDto: UpdateQuoteStatusDto,
	): Promise<IQuoteStockResponse[]> {
		return this.quotesService.getStocks(id, updateQuoteStatusDto);
	}


	@Patch( ':id' )
	update(
		@Param( 'id' ) id: string,
		@Body() updateQuoteDto: UpdateQuoteDto,
	): Promise<Quote> {
		return this.quotesService.update( id, updateQuoteDto );
	}


	@Patch( ':id/status' )
	updateStatus(
		@Param( 'id' ) id: string,
		@Body() updateQuoteStatusDto: UpdateQuoteStatusDto,
	): Promise<Quote> {
		return this.quotesService.updateStatus( id, updateQuoteStatusDto );
	}

}
